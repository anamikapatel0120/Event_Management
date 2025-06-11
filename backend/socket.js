module.exports = (server) => {
  const io = require('socket.io')(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    socket.on('seatBooked', (data) => {
      io.emit('seatUpdated', data);
    });
  });
}

const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });
  return io;
};
