const express         = require('express');
const app             = express();
const config          = require('./server.config');
const bodyParser      = require('body-parser');
const http            = require('http').Server(app);
const io              = require('socket.io')(http);
const uuid            = require('uuid/v4');
const expSession      = require('express-session');
const session         = expSession(config.session);
const memStore        = require('memorystore')(expSession);
const ioSession       = require('express-socket.io-session');

const forceSSL        = require('./util/forceSSL');
const connection      = require('./util/connection');

const port            = process.env.PORT || process.argv[2] || 3000;
const nsps            = {};

let store;

app.use(bodyParser.json());

if(process.env.NODE_ENV === 'production') {
  app.set('trust proxy', config.express.prod.trustProxy);
  app.use(bodyParser.urlencoded(config.express.prod.bodyParser));
  store = new memStore(config.express.prod.store);
  app.use(forceSSL);
} else {
  app.set('trust proxy', config.express.dev.trustProxy);
  app.use(bodyParser.urlencoded(config.express.dev.bodyParser));
  store = new memStore(config.express.dev.store);
}

app.use(session);
io.use(ioSession(session, { autoSave: true}));

//Login Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
  //TODO: handle login
});

//Register Page
app.get('/register', (req, res) => {
  if(req.session.user) {
    res.redirect('/room/'+req.session.uuid);
  } else {
    res.sendFile(__dirname + '/public/register.html');
  }
});

app.post('/register', (req, res) => {
  //TODO: handle register
});

//Room Page
app.get('/room*', (req, res) => {
  
  //if(req.session.user) {
    
    let room = req.params[0];

    if(room.indexOf(' ') >= 0) {
      room = room.replace(/ /g,"_");
      res.redirect(
        [req.headers['x-forwarded-proto'], req.get('Host'), '/room', room].join('')
      );
      return;
    }

    
    if(!nsps[room]) {
      nsps[room] = io.of(room);
      nsps[room].on('connection', connection);
    }
    
    res.sendFile(__dirname + '/public/room.html');

  /*} else {
    res.redirect(
      [req.headers['x-forwarded-proto'], req.get('Host'), req.url].join('')
    );
  }*/
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.use(express.static('public'));

//Handle sockets
io.on('connection', (socket) => {
  //TODO: handle sockets
});

//Start Server
http.listen(port, () => {
  console.log('listening on localhost:' + port);
});
