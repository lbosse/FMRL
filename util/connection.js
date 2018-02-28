const User = require('../controllers/user');

module.exports = (socket) => {

  let user = socket.request.session.user ? socket.request.session.user : {};
  let name = user.nick ? user.nick : user.name;
 
  socket.broadcast.emit('join', name + ' joined the room!');

  socket.on('chat message', (msg) => {
    user = socket.request.session.user ? socket.request.session.user : {};
    name = user.nick ? user.nick : user.name;
    socket.broadcast.emit('chat message', name + ": " + msg.message);
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
    socket.emit('load', {user: socket.request.session.user});
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('unjoin', name + ' has left the room!');
  });
};

let nickname = (args, socket) => {
  let resp = "";
  if(args.length != 2) {
    resp += "invalid args! try /nick &lt;nickname&gt;";
    socket.emit('cmd', { args: args, res: resp, success: false, user: socket.request.session.user });
  } else {
    resp += "Nickname successfully changed to "+args[1];
    User.setNick(socket, args, resp);
  }
}

let join = (args, socket) => {
  let resp = "";
  let success = false;
  let channel = "";
  if(args.length < 2) {
    resp += "invalid args! try /join [&lt;channel&gt; ...]";
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
    let name = socket.adapter.nsp.sockets[k].request.session.user.name;
    let nick = socket.adapter.nsp.sockets[k].request.session.user.nick;
    resp += "<br />" + name + " (" + nick + ")";
  });
  socket.emit('cmd', { args: args, res: resp, success: true });
};

let help = (args, socket) => {
  let resp = "";
  resp  = "<br />--------------------------------------------------------";
  resp += "<br />FMRL V1.0";
  resp += "<br />--------------------------------------------------------";
  resp += "<br />/help";
  resp += "<br />----Shows this prompt<br />";
  resp += "<br />/join &lt;channel...&gt;";
  resp += "<br />----Joins the specified channel<br />";
  resp += "<br />/nick &lt;nickname&gt;";
  resp += "<br />----Sets the users nickname to the specified value<br />";
  resp += "<br />/list";
  resp += "<br />----Lists the current users in the room<br />";
  let success = true;
  socket.emit('cmd', { args: args, res: resp, success: success });
}
