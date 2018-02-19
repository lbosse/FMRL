module.exports = (socket) => {

  //let user = socket.handshake.session.user ? socket.handshake.session.user : {};

  socket.broadcast.emit('join', 'someone joined the room!');

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg.message);
  });

  socket.on('cmd', (msg) => {
    let args = msg.cmd.split(/[ ,]+/).filter(Boolean);
    switch(args[0]) {
      case '/join':
        join(args, socket);
        break;
      case '/nick':
        nickname(args, socket);
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

  socket.on('disconnect', () => {
    socket.broadcast.emit('unjoin', 'someone has left the room!');
  });
};

let nickname = (args, socket) => {
  let resp = "";
  let success = false;
  if(args.length != 2) {
    resp += "invalid args! try /nick <nickname>";
  } else {
    resp += "Nickname successfully changed to "+args[1];
    success = true;
  }
  socket.emit('cmd', { args: args, res: resp, success: success });
};

let join = (args, socket) => {
  let resp = "";
  let success = false;
  let channel = "";
  if(args.length < 2) {
    resp += "invalid args! try /join [<channel> ...]";
  } else {
    channel = args.slice(1, args.length).join('_');
    resp += "Joining channel "+channel+"...";
    success = true;
  }
  socket.emit('cmd', { args: args, res: resp, success: success, channel: channel });
  
};
