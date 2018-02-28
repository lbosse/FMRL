const express         = require('express');
const app             = express();
const config          = require('./server.config');
const bodyParser      = require('body-parser');
const http            = require('http').Server(app);
const io              = require('socket.io')(http);
const uuid            = require('uuid/v4');
const expSession      = require('express-session');
//const memStore        = require('memorystore')(expSession);
//const ioSession       = require('express-socket.io-session');
const morgan          = require('morgan'); // SETUP NEEDED  
const redisAdapter    = require('socket.io-redis');
const redisStore     = require('connect-redis')(expSession);

const userCont        = require('./controllers/user');

const forceSSL        = require('./util/forceSSL');
const connection      = require('./util/connection');

const port            = process.env.PORT || process.argv[2] || 3000;
const nsps            = {};

let sessionStore;

app.use(bodyParser.json());

if(process.env.NODE_ENV === 'production') {
  app.set('trust proxy', config.express.prod.trustProxy);
  app.use(bodyParser.urlencoded(config.express.prod.bodyParser));
  //sessionStore = new memStore(config.express.prod.store);
  sessionStore = new redisStore(config.redis.prod);
  app.use(forceSSL);
  io.adapter(redisAdapter(config.redis.prod));
} else {
  app.set('trust proxy', config.express.dev.trustProxy);
  app.use(bodyParser.urlencoded(config.express.dev.bodyParser));
  //sessionStore = new memStore(config.express.dev.store);
  sessionStore = new redisStore(config.redis.dev);
  io.adapter(redisAdapter(config.redis.dev));
}

// Configure sessions
let sessionConfig = Object.assign({}, {store: sessionStore}, config.session);
// Below we get a TypeError: Converting circular structure to JSON
//console.log('session config options: ' + JSON.stringify(sessionConfig));
let session = expSession(sessionConfig);

app.use(session);

module.exports = io;

//Login Page
app.get('/', (req, res) => {
  if (req.session.user == undefined) {
    res.sendFile(__dirname + '/public/index.html');
  } else {
    res.redirect('/room/'+req.session.uuid);
  }
});

app.post('/', (req, res) => {
  userCont.getUserByEmail(req.body.email).then((user) => {
    if(!user) {
      req.session.msg = 'User "' + req.body.email +'" does not exist.';
      res.redirect('/');
    } else if(userCont.hashPass(req.body).password == user.password) {
      req.session.user = user;
      req.session.msg = 'Login success!';
      req.session.uuid = uuid();
      res.redirect('/room/'+req.session.uuid);
    } else {
      req.session.msg = 'Incorrect password.';
      res.redirect('/');
    }
  });
});

//Register Page
app.get('/register', (req, res) => {
  if(req.session.user != undefined) {
    res.redirect('/room/'+req.session.uuid);
  } else {
    res.sendFile(__dirname + '/public/register.html');
  }
});

app.post('/register', (req, res) => {
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
        req.session.msg = 'Not a valid email.';
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      }
      else if(!userCont.validPw(uobj)) {
        req.session.msg = 'Not a valid password.';
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      }
      else if(uobj.password != req.body.passwordMatch) {
        req.session.msg = 'Passwords do not match.';
        req.session.registerForm = uobj;
        res.redirect('/register');
        return;
      } else {
        uobj = userCont.hashPass(uobj);
        userCont.createUser(uobj).save((err, createdUser) => {
          req.session.user = uobj;
          req.session.msg = 'User created!';
          req.session.uuid = uuid();
          res.redirect('/room/'+req.session.uuid);
          return;
        });
      }
    } else {
      req.session.msg = 'User already exists!';
      res.redirect('/register');
      return;
    }
  });
});

//Room Page
app.get('/room*', (req, res) => {
  // Caching of the room page is diabled to log out properly
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Log user to console - not logged when back button is pushed
  // console.log(req.session.user);

  if(req.session.user != undefined) {
    let room = req.params[0];

    if(room.indexOf(' ') >= 0) {
      room = room.replace(/ /g,"_");
      res.redirect(
        /* Luke - make all redirects like this */
        [req.headers['x-forwarded-proto'], req.get('Host'), '/room', room].join('')
      );
      return;
    }

    
    if(!nsps[room]) {
      nsps[room] = io.of(room);
      nsps[room].on('connection', connection);
      //nsps[room].use(ioSession(session, { autoSave: true }));
      nsps[room].use((socket, next) => {
        session(socket.request, socket.request.res, next);
      });
    }
    
    res.sendFile(__dirname + '/public/room.html');

  } else {
    //console.log([req.headers['x-forwarded-proto'], req.get('Host'), req.url].join(''));
    res.redirect(
      [req.headers['x-forwarded-proto'], req.get('Host'), req.url].join('')
    );
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  // Below doesn't redirect to home
  /*
  res.redirect(
    [req.headers['x-forwarded-proto'], req.get('Host'), '/'].join('')
  );
  */
  res.redirect('/');
});

app.use(express.static('public'));

//Handle sockets on empty room
io.on('connection', connection);
io.use((socket, next) => {
  session(socket.request, socket.request.res, next);
});

//Start Server
http.listen(port, () => {
  console.log('listening on localhost:' + port);
});
