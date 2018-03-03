const User = require('../controllers/user');

module.exports = function(socket) {
  if(!socket.adapter.nsp.users) {
    socket.adapter.nsp.users = [];
  }
  socket.adapter.nsp.users.push(socket.request.session.user);
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
        join(args, socket);
        break;
      case '/quit':
        socket.emit('cmd', {args: args});
        break;
      case '/help':
        help(args, socket);
        break;
      case '/stats':
        stats(args, socket);
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
    let remove = socket.request.session.user.name;
    for(let i = 0; i < socket.adapter.nsp.users.length; i++) {
      let user = socket.adapter.nsp.users[i];
      if(user.name = remove) {
        socket.adapter.nsp.users.splice(i, 1);
        break;
      }
    }
  });
};

let stats = (args, socket) => {
  let username = socket.request.session.user.name;
  let room = "/room"+socket.adapter.nsp.name + "/";
  let uInRoom = socket.adapter.nsp.users.length;
  let joined = socket.handshake.time;
  let success = false;
  if(uInRoom && joined) {
    success = true;
  }

  let resp = "";
  resp += "<br />=========================================";
  resp += "<br />FMRL://"+ username + "/stats" + room;
  resp += "<br />=========================================";
  resp += "<br />Joined "+room+": ";
  resp += "<br />---- " +joined + "<br />";
  resp += "<br />Users in "+room+": "
  resp += "<br />---- " + uInRoom + "<br />";

  socket.emit('cmd', { args: args, res: resp, success: success});

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
    if(args[0] == '/leave') {
      channel = socket.request.session.uuid;
      resp += "Joining channel "+channel+"...";
      success = true;
    } else {
      resp += "invalid args! try /join [&lt;channel&gt; ...]";
      success = false;
    }
  } else {
      if(args[0] == '/leave') {
        channel = socket.request.session.uuid;
        resp += "Joining channel "+channel+"...";
        success = true;
      } else {
        success = true;
        channel = args.slice(1, args.length).join('_');
        resp += "Joining channel "+channel+"...";
      }
  }

  socket.emit('cmd', { args: args, res: resp, success: success, channel: channel });
  
};

let list = (args, socket, room) => {
  let resp = "<br />Current connections to the room: ";
  let clients = socket.adapter.nsp.server.engine.clients;
  let users = socket.adapter.nsp.users;
  for(k in users) {
    let name = users[k].name;
    let nick = users[k].nick;
    resp += "<br />" + name + " (" + nick + ")";
  }
  socket.emit('cmd', { args: args, res: resp, success: true });
};

let help = (args, socket) => {
  let resp = "";
  resp += "<br />=========================================";
  resp += "<br />FMRL://help/V1.0";
  resp += "<br />=========================================";
  resp += "<br />User commands:";
  resp += "<br />-----------------------------------------";
  resp += "<br />/help";
  resp += "<br />---- Shows this prompt<br />";
  resp += "<br />/join &lt;channel...&gt;";
  resp += "<br />---- Joins the specified channel<br />";
  resp += "<br />/leave";
  resp += "<br />---- Leaves current room <br />";
  resp += "<br />/nick &lt;nickname&gt;";
  resp += "<br />---- Sets your current nickname<br />";
  resp += "<br />/list";
  resp += "<br />---- Lists the users in the room<br />";
  resp += "<br />/stats";
  resp += "<br />---- Displays stats about the user<br />";
  resp += "<br />/quit";
  resp += "<br />---- Logs out and destroys user session<br />";
  let success = true;
  socket.emit('cmd', { args: args, res: resp, success: success });
}
