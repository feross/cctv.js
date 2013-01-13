var socket = io.connect('http://localhost');

var adminWidth = $(window).width()
  , adminHeight = $(window).height()

log('adminWidth: ' + adminWidth)

var grid = new Grid()

// Socket code
socket.on('connect', function() {
  socket.emit('admin-start', {})
})

socket.on('client-connected', function(data) {
  log("connected: ", data)
  grid.add(data)
})

socket.on('client-updated', function(data) {
  log("updated: ", data)
  grid.update(data)
})

socket.on('client-disconnected', function(data) {
  log("disconnected: ", data.id)
  // grid.remove(data.id)
})

socket.on('disconnect', function() {  
  log("LOST SERVER CONNECTION!")
})


function Grid () {
  this.numFrames = 0
  this.iframes = []
}

Grid.prototype.add = function (data) {
  this.numFrames += 1
  var $iframe = $('<iframe>')

  $iframe
    .addClass('site')
    .attr('id', data.id).attr('name', data.id)
    .attr('src', data.src)

  this.iframes.push($iframe)
  
  $iframe.appendTo('.grid')
  setupIFrame($iframe)

  // Immediately trigger update for new iframe
  this.update(_.omit(data, 'src'))
}

Grid.prototype.update = function (data) {
  var self = this
    , $iframe = $('#' + data.id)
    , iframe = $iframe[0]

  if (data.src) {
    // Load new site in existing iframe
    $iframe.attr('src', data.src)
    setupIFrame($iframe)

    // Continue `update` function when iframe src has changed in DOM
    setTimeout(function () {
      self.update(_.omit(data, src))
    }, 0)
    return 
  }

  if (data.width != null) {
    $iframe.width(data.width)
  }

  if (data.height != null) {
    $iframe.height(data.height)
  }

  var iframeWindow = iframe.contentWindow
    ? iframe.contentWindow
    : iframe.contentDocument.defaultView

  var onLoad = function () {
    var iframeJQ = iframeWindow.$
    
    if (data.scrollTop != null) {
      iframeJQ(iframeWindow).scrollTop(data.scrollTop)
    }
    if (data.scrollLeft) {
      iframeJQ(iframeWindow).scrollLeft(data.scrollLeft)
    }
  }

  if (iframe.CCTV_DOM_LOADED) {
    onLoad()
  } else {
    iframe.CCTV_ON_LOAD = onLoad
  }

  self.layout()
}


/**
 * Setup iframe to track onload events
 * @param  {jQuery Element} $iframe
 */
function setupIFrame ($iframe) {
  var iframe = $iframe[0]

  iframe.CCTV_DOM_LOADED = false

  iframe.addEventListener('load', function () {
    if (iframe.CCTV_ON_LOAD) {
      iframe.CCTV_ON_LOAD()
    }
    iframe.CCTV_DOM_LOADED = true
  }, false)
}


Grid.prototype.layout = function () {
  this.iframes.forEach(function($iframe) {
    var clientWidth = $iframe.width()
      , clientHeight = $iframe.height()
      , scaleFactor = 1

    if (clientWidth > adminWidth) {
      scaleFactor = adminWidth / clientWidth
    }
    if (clientHeight > adminHeight) {
      var s = adminHeight / clientHeight
      if (s < scaleFactor) {
        scaleFactor = s
      }
    }
    log('scaleFactor' + scaleFactor)
    $iframe.css({transform: 'scale(' + scaleFactor + ')'})
    setTimeout(function () {
      var position = $iframe.position()
        , iframeWidth = $iframe.width() * scaleFactor
        , iframeHeight = $iframe.height() * scaleFactor
        , xOffsetForCentering = (adminWidth - iframeWidth) / 2
        , yOffsetForCentering = (adminHeight - iframeHeight) / 2

      $iframe.css({
        top: -position.top + yOffsetForCentering,
        left: -position.left + xOffsetForCentering
      })

    }, 0)
  })
}


// grid.add({
//   id: 'a',
//   src: '/sample/index.html',
//   width: 1440,
//   height: 900,
//   scrollTop: 50,
//   scrollLeft: 0
// })

// setTimeout(function() {
//   grid.add({
//     id: 'b',
//     src: '/sample/about.html',
//     width: 1440,
//     height: 900,
//     scrollTop: 50,
//     scrollLeft: 0
//   })
// }, 1000)
