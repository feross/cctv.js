var socket = io.connect('http://localhost');

// socket.on('news', function (data) {
//   console.log(data);
//   socket.emit('my other event', { my: 'data' });
// });

var grid = new Grid()

function Grid () {
  
}

var socket = io.connect('http://localhost')

socket.on('connect', function() {
  socket.emit('admin-start', {})
})

socket.on('client-connected', function(data) {
  log("connected: ", data)
})

socket.on('client-updated', function(data) {
  log("updated: ", data)
})

socket.on('client-disconnected', function(data) {
  log("disconnected: ", data.id)
})

socket.on('disconnect', function() {
  log("LOST SERVER CONNECTION!")
})

// Grid.prototype.add