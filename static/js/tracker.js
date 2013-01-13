var socket = io.connect('http://localhost');

// collects initial info the page (size, scroll position)
// socket.emit('update', {});

// periodically send updates

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});