var THROTTLE_TIME = 100

var BrowserDetect = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "an unknown version";
    this.OS = this.searchString(this.dataOS) || "an unknown OS";
  },
  searchString: function (data) {
    for (var i=0;i<data.length;i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {   string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {   // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {     // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS : [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
         string: navigator.userAgent,
         subString: "iPhone",
         identity: "iPhone/iPod"
      },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]

};
BrowserDetect.init();



function sendTopLeft() {
  var top = $(window).scrollTop()
    , left = $(window).scrollLeft()

  log("top, left ", top, left)
  return {scrollTop: top, scrollLeft: left}  
}

function sendWidthHeight() {
  var width = $(window).width()
    , height = $(window).height()

  log("width, height ", width, height)
  return {width: width, height: height}
}

function sendMousePos(event) {
  var x = event.pageX - $(window).scrollLeft()
    , y = event.pageY - $(window).scrollTop()

  log("mouse x, y", x, y)
  return {mousex: x, mousey: y}
}

function sendSource(event) {
  return {src: window.location.href}
}

function sendSystemInfo(event) {
  var browser
    , os

  // Browser detect
  if (BrowserDetect.browser == "Chrome") {
    browser = 'chrome'
  } else if (BrowserDetect.browser == "Firefox") {
    browser = 'firefox'
  } else if (BrowserDetect.browser == "Safari") {
    browser = 'safari'
  } else {
    browser = 'chrome' // fallback to wrong browser UI
  }

  // OS detect
  if (BrowserDetect.OS == "Mac") {
    os = 'osx'
  } else if (BrowserDetect.OS == "Windows") {
    os = 'windows'
  } else if (BrowserDetect.OS == "Linux") {
    os = 'linux'
  } else {
    os = 'osx' // fallback to wrong OS UI
  }

  return {browser: browser, os: os}
}

if(top === self) {
  var socket = io.connect('http://' + window.location.hostname)

  socket.on('connect', function() {
    id = window.localStorage.getItem('cctv_tracker_id')
    socket.emit('tracked-start', {id: id})
    log("id: ", id)
  })

  socket.on('start-updating', function(data) {
    if(data.id) {
      window.localStorage.setItem('cctv_tracker_id', data.id)
      log("updated id: ", data.id)
    }

    $(function() {
      var toSend = _.extend({}, sendTopLeft(), sendWidthHeight(), sendSource(), sendSystemInfo())
      socket.emit('update', toSend)

      $(window).on('scroll', _.throttle(function() {
        socket.emit('update', sendTopLeft())
      }, THROTTLE_TIME))
      $(window).on('resize', _.throttle(function() {
        socket.emit('update', sendWidthHeight())
      }, THROTTLE_TIME))
      $(document).on('mousemove', _.throttle(function(event) {
        socket.emit('update', sendMousePos(event))
      }, THROTTLE_TIME))
      $(document).on('mousedown', function(event) {
        var data = sendMousePos(event)
        data.type = 'click'
        socket.emit('event', data)
      })
    })
  })
}

// collects initial info the page (size, scroll position)
// socket.emit('update', {});

// periodically send updates

