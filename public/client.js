$(function () {
  let room = decodeURI(
    window.location.pathname.substr(window.location.pathname.lastIndexOf('/'))
  );
  let socket = io(room);
  
  //Handle focusing and clicking functionality for major components
  $('#room').val(room.substr(1));
  $('#m').focus();
  
  $('#room').on('click', function() {
    $(this).select();
  });

  $('#messages').on('click', function() {
    $('#m').focus();
  });

  $('form.join').submit(function() {
    window.location = '/room/'+$('#room').val().replace(/ /g,"_");
    return false;
  });

  //Handle onload
  socket.emit('load', {});
  socket.on('load', function(res) {
    if(res.user) {
      $('.username').text(res.user.name);
    }
    print('Welcome to FMRL. Type /help for a list of commands.', 'system');
  });

  socket.on('join', function(msg) {
    print(msg, 'system');
  });

  socket.on('unjoin', function(msg) {
    print(msg, 'system');
  });

  //handle messages
  $('form.msgr').submit(function() {
    let val = $('#m').val();
    if(val.length > 0) {
      if(val[0] == '/') {
        socket.emit('cmd', {cmd: val, room: window.location.pathname});
      } else {
        socket.emit('chat message', {message: val, room: window.location.pathname});
      }
      print(val, 'message');
    }
    $('#m').val('');
    return false;
  });

 socket.on('chat message', function(msg) {
   print(msg, 'info');
 });

 socket.on('cmd', function(cmd) {
   console.log(cmd);
   if(cmd.success) {
      print(cmd.res, 'system');
      if(cmd.args[0] == '/join') {
        window.location = '/room/'+cmd.channel;
      }
   } else {
      print(cmd.res, 'error');
   }
 });

});

function print(msg, type) {
  let printable = "";
  switch(type) {
    case 'system':
      printable += 'System: ' + msg;
      printSystem(printable);
      break;
    case 'error':
      printable += 'Error: ' + msg;
      printError(printable);
      break;
    case 'message':
      printable += msg;
      printMessage(printable);
      break;
    default:
      printable += msg;
      printInfo(printable);
  }
  $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

function printSystem(printable) {
  $('#messages').append($('<li class="text-success">').text(printable));
}

function printError(printable) {
  $('#messages').append($('<li class="text-danger">').text(printable));

}

function printMessage(printable) {
  $('#messages').append($('<li class="text-dark">').text(printable));
}

function printInfo(printable) {
  $('#messages').append($('<li class="text-primary">').text(printable));
}
