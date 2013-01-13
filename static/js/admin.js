var socket = io.connect('http://localhost');

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
    , $iframe = $('#' + data.id + ' iframe')
    , iframe = $iframe[0]

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
  // if (data.mousex && data.mousey) {
  //   var $cursor = $('<img>')
  //   $cursor.addClass('cursor')
  //   $cursor.
  // }
}

Grid.prototype.remove = function (id) {
  $item = $(id)
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