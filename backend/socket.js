// const socketIo = require('socket.io');

// module.exports = (server) => {
//   const io = require('socket.io')(server, { cors: { origin: '*' } });
//   io.on('connection', (socket) => {
//     socket.on('seatBooked', (data) => {
//       io.emit('seatUpdated', data);
//     });
//   });
// }

// module.exports = (server) => {
//   const io = socketIo(server, { cors: { origin: '*' } });
//   return io;
// };

// let io;
// module.exports = {
//   init: (server) => {
//     io = socketIo(server, { cors: { origin: '*' } });
//     io.on('connection', socket => {
//       console.log('Client connected:', socket.id);
//     });
//   },
//   getIO: () => io
// };

const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: 'http://localhost:3000', // or '*', but use actual origin in production
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('seatBooked', (data) => {
        // Emit to all clients subscribed to that event
        io.emit(`seat-update-${data.event_id}`, {
          seats_booked: data.seats_booked,
        });
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};

