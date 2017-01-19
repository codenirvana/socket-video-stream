const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const device = require('express-device');

app.use(device.capture());

app.get('/', (req, res) => {
  res.sendFile(req.device.type+'.html', { root : __dirname});
});

io.on('connection', (socket) => {

  socket.on('joinRoom', function(room) {
    if(!(room in socket.adapter.rooms)) {
      return socket.emit('invalid', 'Invalid code');
    }
    socket.join(room);
    io.sockets.in(room).emit('message', 'what is going on, party people?');
  });

  socket.on('newRoom', (room) => {
    socket.join(room);
  });

});

http.listen(3000, () => console.log("http://localhost:3000"));
