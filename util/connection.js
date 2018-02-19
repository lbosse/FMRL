module.exports = (socket) => {

  //let user = socket.handshake.session.user ? socket.handshake.session.user : {};

  socket.emit('join', 'someone joined the room!');

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg.message);
  });

  socket.on('cmd', (msg) => {
    let args = msg.split(/[ ,]+/).filter(Boolean);
    switch(args[0]) {
      case '/nick':
        socket.emit('cmd', {args: args});
        break;
      case '/list':
        socket.emit('cmd', {args: args});
        break;
      case '/leave':
        socket.emit('cmd', {args: args});
        break;
      case '/quit':
        socket.emit('cmd', {args: args});
        break;
      case '/help':
        socket.emit('cmd', {args: args});
        break;
      case '/stats':
        socket.emit('cmd', {args: args});
        break;
      default:
        socket.emit('cmd', {args: args});
        break;
    }
  });

  socket.on('load', () => {
    socket.emit('load', {user: 'user object here eventually'});
  });

  socket.on('disconnect', () => {});
};
