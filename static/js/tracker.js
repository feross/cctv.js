var THROTTLE_TIME = 500

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
  var x = event.pageX
    , y = event.pageY

  log("mouse x, y", x, y)
  return {mousex: x, mousey: y}
}

function sendSource(event) {
  return {src: window.location.href}
}

if(top === self) {
  var socket = io.connect('http://localhost')

  socket.on('connect', function() {
    cookie = window.localStorage.getItem('cctv_tracker_id')
    socket.emit('tracked-start', {cookie: cookie})
    log("id: ", cookie)
  })

  socket.on('startupdate', function(data) {
    if(data.cookie !== undefined) {
      window.localStorage.setItem('cctv_tracker_id', data.cookie)
      log("updated id: ", data.cookie)
    }

    $(function() {
      var toSend = _.extend({}, sendTopLeft(), sendWidthHeight(), sendSource())
      socket.emit('update', toSend)
    })

    $(window).on('scroll', _.throttle(function() {
      socket.emit('update', sendTopLeft())
    }, THROTTLE_TIME))
    $(window).on('resize', _.throttle(function() {
      socket.emit('update', sendWidthHeight())
    }, THROTTLE_TIME))
    $(document).on('mousemove', _.throttle(function(event) {
      socket.emit('update', sendMousePos(event))
    }, THROTTLE_TIME))
  })
}

// collects initial info the page (size, scroll position)
// socket.emit('update', {});

// periodically send updates

