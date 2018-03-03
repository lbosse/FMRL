(function() {
  const socket = io('/');
  let user;

  // Emit tests
  socket.emit('load', {});
  socket.emit('cmd', {cmd: '/help', room: '/'});
  socket.emit('cmd', {cmd: '/list', room: '/'});
  socket.emit('cmd', {cmd: '/stats', room: '/'});
  let testNick = Date.now();
  let nickCmd = '/nick ' + testNick;
  socket.emit('cmd', {cmd: nickCmd, room: '/'});
  

  // Catch test results
  socket.on('load', (res) => {
    if(res.user) {
      user = res.user;
    }
    console.log('TEST CONNECTION PASSED');
  });

  socket.on('cmd', (cmd) => {
    let pass = false;
    
    if (
      (cmd.args[0] == '/help' || 
       cmd.args[0] == '/stats') && 
       cmd.res != undefined
    ) {
      pass = true;
    }
      
    if(cmd.args[0] == '/list') {
      if((cmd.res.indexOf(user.name) > 0)) {
        pass = true;
      }
    }

    if(cmd.args[0] == '/nick' && cmd.res != undefined) {
      if(cmd.res == 'Nickname successfully changed to ' + testNick) {
        pass = true;
      }
    }

    if(pass) {
      console.log('TEST ' + cmd.args[0] + ' PASSED');
    } else {
      console.log('TEST ' + cmd.args[0] + ' FAILED');
    }
  });
})();
