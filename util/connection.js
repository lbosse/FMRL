module.exports = (socket) => {

  let user = socket.handshake.session.user;

  socket.emit('join', 'someone joined the room!');

  socket.on('chat message', (id, msg) => {
    socket.broadcast.to(id).emit('chat message', msg);
  });

  socket.on('cmd', (msg) => {
    let args = msg.split(/[ ,]+/).filter(Boolean);
    switch(args[0]) {
      case '/nick':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      case '/list':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      case '/leave':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      case '/quit':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      case '/help':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      case '/stats':
        socket.to(socket.id).emit('cmd', {args: args});
        break;
      default:
        socket.to(socket.id).emit('cmd', {args: args});
        break;
    }
  });

  socket.on('load', () => {
    io.to(socket.id).emit('load', {user: 'user object here eventually'});;
  });

  socket.on('disconnect', () => {});
};
