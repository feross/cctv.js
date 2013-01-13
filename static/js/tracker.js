var socket = io.connect('http://localhost')
  , THROTTLE_TIME = 500

$(window).on('scroll', _.throttle(function (event) {
  var top = $(window).scrollTop()
    , left = $(window).scrollLeft()

  log(top, left)
}, THROTTLE_TIME))

$(window).on('resize', _.throttle(function (event) {
  var width = $(window).width()
    , height = $(window).height()

  log(width, height)
}, THROTTLE_TIME))

$(document).on('mousemove', _.throttle(function (event) {
  var x = event.pageX
    , y = event.pageY

  log(x, y)
}, 50))


// collects initial info the page (size, scroll position)
// socket.emit('update', {});

// periodically send updates



// socket.on('news', function (data) {
//   console.log(data);
//   socket.emit('my other event', { my: 'data' });
// });