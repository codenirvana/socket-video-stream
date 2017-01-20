const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const device = require('express-device');

app.use(device.capture());

app.get('/', (req, res) => {
  const fileName = (req.device.type == "phone") ? "phone" : "desktop";
  res.sendFile(fileName+'.html', { root : __dirname});
});

let clients = {};

io.on('connection', (socket) => {

  clients[socket.id] = false;

  socket.on('stream', (image) => {
    const room = clients[socket.id];
    socket.in(room).broadcast.emit('stream', image);
  });

  socket.on('newRoom', (room) => {
    socket.join(room);
    clients[socket.id] = room;
  });

  socket.on('joinRoom', function(room) {
    if(!(room in socket.adapter.rooms)) {
      return socket.emit('invalid');
    }
    socket.join(room);
    clients[socket.id] = room;
    io.sockets.in(room).emit('joined');
  });

  socket.on('disconnect', function(){
    const room = clients[socket.id];
    if(room) {
      io.sockets.in(room).emit('disconnected');
    }
    delete clients[socket.id];
  });

});

http.listen(3000, () => console.log("http://localhost:3000"));
