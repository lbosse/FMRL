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
    window.location = '/room/'+$('#room').val();
  });

  //Handle onload
  socket.emit('load', {});
  socket.on('load', function(res) {
    if(res.user) {
      $('.username').text(res.user.name);
    }
    print('Welcome to FMRL. Type /help for a list of commands.', 'system');
  });

  //handle messages
  $('form.msgr').submit(function() {
    let val = $('#m').val();
    if(val.length > 0) {
      socket.emit('chat message', {message: val, room: window.location.pathname});
      print(val, 'message');
    }
    $('#m').val('');
    return false;
  });

 socket.on('chat message', function(msg) {
   print(msg, 'info');
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
