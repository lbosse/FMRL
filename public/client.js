$(function () {
  let room = decodeURI(
    window.location.pathname.substr(window.location.pathname.lastIndexOf('/'))
  );
  let socket = io(room);
  
  $('#room').val(room.substr(1));
  $('#m').focus();
  
  $('#room').on('click', function() {
    $(this).select();
  });

  $('#messages').on('click', function() {
    $('#m').focus();
  });

  socket.emit('load', {});
  socket.on('load', function(res) {
    if(data.user) {
      $('.username').text(data.user.name);
    }

  });

});

function print(msg, type) {
  
}
