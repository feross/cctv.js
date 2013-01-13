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
    id = window.localStorage.getItem('cctv_tracker_id')
    socket.emit('tracked-start', {id: id})
    log("id: ", id)
  })

  socket.on('start-updating', function(data) {
    if(data.cookie) {
      window.localStorage.setItem('cctv_tracker_id', data.id)
      log("updated id: ", data.id)
    }

    $(function() {
      var toSend = _.extend({}, sendTopLeft(), sendWidthHeight(), sendSource())
      socket.emit('update', toSend)

      $(window).on('scroll', _.throttle(function() {
        socket.emit('update', sendTopLeft())
      }, THROTTLE_TIME))
      $(window).on('resize', _.throttle(function() {
        socket.emit('update', sendWidthHeight())
      }, THROTTLE_TIME))
      $(document).on('mousemove', _.throttle(function(event) {
        socket.emit('update', sendMousePos(event))
      }, 50))
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

