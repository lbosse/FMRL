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
const morgan          = require('morgan'); // SETUP NEEDED  
const userCont        = require('controllers/user');

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

//Login Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
  userCont.getUser(req.body).then((user) => {
    /*
    if(!user) {
      login.auth = false;
      login.msg = 'User "' + userData.email() +'" does not exist.';
    } else if(hashPass(userData).password == user.password) {
      login.auth = true;
      login.msg = 'Login success!';
    } else {
      login.auth = false;
      login.msg = 'Incorrect password.';
    }
    res.json(login);
    */
    console.log(user);
    res.send(200);
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
  userCont.createUser(req.body).then((outcome) => {
    /*
    if (outcome.created) {
      res.json(201, outcome.msg);
    } else {
      res.json(200, outcome.msg);
    }
    */
    res.send(200);
});

//Room Page
app.get('/room*', (req, res) => {
  
  //if(req.session.user) {
    
    let room = req.params[0];
    
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
