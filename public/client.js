$(function () {
  let room = decodeURI(
    window.location.pathname.substr(window.location.pathname.lastIndexOf('/'))
  );
  let socket = io(room);
  let username = "";

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
      username = res.user.nick ? res.user.nick : res.user.name;
      $('.username').text(res.user.name);
    }
    socket.emit('cmd', {cmd: '/help',room: window.location.pathname});
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
        if(val.indexOf('nick') > 0) {
          let url = '/nick';
            fetch(url, {
              method: 'POST', 
              credentials: 'same-origin',
              body: JSON.stringify({ cmd: val }) ,
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            });
        }
        if(val.indexOf('quit') > 0) {
          window.location = '/logout';
        }
        socket.emit('cmd', {cmd: val, room: window.location.pathname});
      } else {
        socket.emit('chat message', {message: val, room: window.location.pathname});
      }
      print(username + ": " + val, 'message');
    }
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(msg) {
    print(msg, 'info');
  });

  socket.on('cmd', function(cmd) {
    if(cmd.success) {
      print(cmd.res, 'system');
      if(cmd.args[0] == '/join' || cmd.args[0] == '/leave') {
        window.location = '/room/'+cmd.channel;
      }
      if(cmd.user) {
        username = cmd.user.nick ? cmd.user.nick : cmd.user.name;
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
  $('#messages').append($('<li class="text-success">').html(printable));
}

function printError(printable) {
  $('#messages').append($('<li class="text-danger">').html(printable));

}

function printMessage(printable) {
  $('#messages').append($('<li class="text-dark">').text(printable));
}

function printInfo(printable) {
  $('#messages').append($('<li class="text-primary">').text(printable));
}
