var socket = io.connect('http://' + window.location.hostname)

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

socket.on('client-event', function(data) {
  log("event: ", data)
  if(data.type == 'click') {
    // Handle click
  }
})

socket.on('client-disconnected', function(data) {
  log("disconnected: ", data.id)
  grid.remove(data.id)
})

socket.on('disconnect', function() {  
  log("LOST SERVER CONNECTION!")
})

function Grid () {
  this.numFrames = 0
  this.iframes = []
  this.cursorTimeouts = {}

  $('.grid').isotope({
    itemSelector : '.site',
    layoutMode: 'fitRows'
    // layoutMode: 'masonry',
    // masonry: {
    //   columnWidth: 300
    // }
  })
}

Grid.prototype.add = function (data) {
  this.numFrames += 1
  var $iframe = $('<iframe>')

  $iframe.attr('src', data.src).attr('name', data.id)


  this.iframes.push($iframe)

  $siteDiv = $('<div>')
    .attr('id', data.id)
    .addClass('site')

  $iframe.appendTo($siteDiv)
  
  $('.grid').isotope('insert', $siteDiv)
  setupIFrame($iframe)

  // Immediately trigger update for new iframe
  this.update(_.omit(data, 'src'))
}

Grid.prototype.update = function (data) {
  var self = this
    , $site = $('#' + data.id)
    , $iframe = $('#' + data.id + ' iframe')
    , iframe = $iframe[0]
  log(data)
  if (data.src) {
    // Load new site in existing iframe
    $iframe.attr('src', data.src)
    setupIFrame($iframe)

    // Continue `update` function when iframe src has changed in DOM
    setTimeout(function () {
      self.update(_.omit(data, 'src'))
    }, 0)
    return 
  }

  if (data.width != null) {
    $iframe.width(data.width)
  }

  if (data.height != null) {
    $iframe.height(data.height)
  }

  if (data.browser) {
    $site.addClass(data.browser)
  }

  if (data.os) {
    $site.addClass(data.os)
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

    window.setTimeout(function () {
      $('.grid').isotope('reLayout')
    }, 300) // same time as CSS `.site iframe`
  }

  if (iframe.CCTV_DOM_LOADED) {
    onLoad()
  } else {
    iframe.CCTV_ON_LOAD = onLoad
  }

  // Update cursor position
  if (data.mousex && data.mousey) {
    var $cursor = $('#cursor-' + data.id)

    if ($cursor.length == 0) {
      $cursor = $('<div>')
      $cursor
        .attr('id', 'cursor-' + data.id)
        .addClass('cursor')
        .appendTo('#'+data.id)
    }

    $cursor.css({
      top: data.mousey + 80 /* browser UI offset */ - 50 /* center cursor */,
      left: data.mousex - 50 /* center cursor */
    })

    // Fade out cursor when it's not moved for 1 second
    clearTimeout(this.cursorTimeouts[data.id])
    this.cursorTimeouts[data.id] = window.setTimeout(function () {
      $cursor.fadeOut(300, function () {
        $cursor.remove()
      })
    }, 1000)

  }
}

Grid.prototype.remove = function (id) {
  $item = $('#' + id)
  $('.grid').isotope('remove', $item)
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