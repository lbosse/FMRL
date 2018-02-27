module.exports = (socket) => {

  //let user = socket.handshake.session.user ? socket.handshake.session.user : {};
  socket.broadcast.emit('join', socket.id+' joined the room!');

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', socket.id + ": " + msg.message);
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
        list(args, socket, msg.room);
        break;
      case '/leave':
        socket.emit('cmd', {args: args});
        break;
      case '/quit':
        socket.emit('cmd', {args: args});
        break;
      case '/help':
        help(args, socket);
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
    socket.emit('load', {user: { name: socket.id }});
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

let list = (args, socket, room) => {
  let resp = "<br />Current connections to the room: ";
  Object.keys(socket.adapter.nsp.sockets).forEach((k) => {
    resp += "<br />" + k;
  });
  socket.emit('cmd', { args: args, res: resp, success: true });
};

let help = (args, socket) => {
  let resp = "";
  resp  = "<br />--------------------------------------------------------";
  resp += "<br />FMRL V1.0";
  resp += "<br />--------------------------------------------------------";
  resp += "<br />/help";
  resp += "<br />----Shows this prompt";
  resp += "<br />/join <channel...>";
  resp += "<br />----Joins the specified channel";
  resp += "<br />/nick <nickname>";
  resp += "<br />----Sets the users nickname to the specified value";
  resp += "<br />/list";
  resp += "<br />----Lists the current users in the room";
  let success = true;
  socket.emit('cmd', { args: args, res: resp, success: success });
}
