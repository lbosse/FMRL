const express         = require('express');
const app             = express();
const config          = require('./server.config');
const bodyParser      = require('body-parser');
const http            = require('http').Server(app);
const io              = require('socket.io')(http);
const uuid            = require('uuid/v4');
const expSession      = require('express-session');
//const session         = expSession(config.session); // uses unsafe default store
const memStore        = require('memorystore')(expSession);
const ioSession       = require('express-socket.io-session');
const morgan          = require('morgan'); // SETUP NEEDED  
const userCont        = require('./controllers/user');

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

// Configure sessions
var sessionConfig = config.session;
sessionConfig.store = store; 
app.use(expSession(sessionConfig));

//Login Page
app.get('/', (req, res) => {
  if (!req.session.login) {
    var login = {user: null, auth: false, msg: ''};
    req.session.login = login;
  }
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
  var login = {user: null, auth: false, msg: ''};
  userCont.getUserByEmail(req.body.email).then((user) => {
    if(!user) {
      login.msg = 'User "' + req.body.email +'" does not exist.';
      req.session.login = login;
    } else if(userCont.hashPass(req.body).password == user.password) {
      login.user = user;
      login.auth = true;
      login.msg = 'Login success!';
      req.session.login = login;
    } else {
      login.msg = 'Incorrect password.';
      req.session.login = login;
    }
    res.json(login);
  });
});

//Register Page
app.get('/register', (req, res) => {
  if(req.session.login.user) {
    res.redirect('/room/'+req.session.uuid);
  } else {
    res.sendFile(__dirname + '/public/register.html');
  }
});

app.post('/register', (req, res) => {
  var login = {user: null, auth: false, msg: ''};
  userCont.getUserByEmail(req.body.email).then((user) => {
    if(!user) {
      var uobj = {
        email: req.body.email, 
        name: req.body.name,
        nick: '',
        password: req.body.password,  
        active: true
      };

      if(!userCont.validEmail(uobj)) {
        login.msg = 'Not a valid email.';
        req.session.login = login;
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      }
      else if(!userCont.validPw(uobj)) {
        login.msg = 'Not a valid password.';
        req.session.login = login;
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      }
      else if(uobj.password != req.body.passwordMatch) {
        login.msg = 'Passwords do not match.';
        req.session.login = login;
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      } else {
        uobj = userCont.hashPass(uobj);
        userCont.createUser(uobj).save((err, createdUser) => {
          login.user = uobj;
          login.auth = true;
          login.msg = 'User created!';
          res.redirect('/room/'+req.session.uuid);
          return;
        });
      }
    } else {
      login.msg = 'User already exists!';
      req.session.login = login;
      res.redirect('/register');
      return;
    }
  });
});

//Room Page
app.get('/room*', (req, res) => {

  if(req.session.login.user) {
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

  } else {
    res.redirect(
      [req.headers['x-forwarded-proto'], req.get('Host'), req.url].join('')
    );
  }
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
