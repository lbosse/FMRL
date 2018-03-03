// Check for valid command line arguments
let args = process.argv;
if (args.length != 6) {
  console.log('USAGE: ChatServer server.js -p <port#> -d <debug-level>');
  process.exit();
} else if (args[2] != '-p' || args[4] != '-d') {
  console.log('INVALID ARGUMENTS');
  console.log('USAGE: ChatServer server.js -p <port#> -d <debug-level>');
  process.exit();
} else if (isNaN(args[3]) || args[3] < 1024 || args[3] > 65535) {
  console.log('INVALID PORT NUMBER');
  console.log('USAGE: ChatServer server.js -p <port#> -d <debug-level>');
  process.exit();
} else if (isNaN(args[5]) || args[5] < 0 || args[5] > 1) {
  console.log('INVALID DEBUG LEVEL');
  console.log('USAGE: ChatServer server.js -p <port#> -d <debug-level>');
  process.exit();
}

// Start setting up server and logging middleware
const express         = require('express');
const app             = express();
const morgan          = require('morgan'); 

// Configure logging
morgan.token('id', function getId (req) {
  return "cluster: " + cluster.worker.id + " - ";
});
if (args[5] == 0) {
  app.use(morgan(':id :method :url :status :response-time ms - :res[content-length]', {
    skip: function (req, res) { return res.statusCode < 400 }
  }));
} else {
  process.env['DEBUG'] = 'socket.io:*';
  app.use(
    morgan(':id :method :url :status :response-time ms - :res[content-length]')
  );
}

// Set up the rest of the server
const config          = require('./server.config');
const bodyParser      = require('body-parser');
const http            = require('http').Server(app);
const io              = require('socket.io')(http);
const uuid            = require('uuid/v4');
const expSession      = require('express-session');
const redisAdapter    = require('socket.io-redis');
const redisStore      = require('connect-redis')(expSession);
const userCont        = require('./controllers/user');
const forceSSL        = require('./util/forceSSL');
const connection      = require('./util/connection');
const port            = process.env.PORT || process.argv[3] || 3000;
const nsps            = {};
const sticky          = require('sticky-session'); 
const cluster         = require('cluster'); 

let sessionStore;

app.use(bodyParser.json());

if(process.env.NODE_ENV === 'production') {
  app.set('trust proxy', config.express.prod.trustProxy);
  app.use(bodyParser.urlencoded(config.express.prod.bodyParser));
  sessionStore = new redisStore(config.redis.prod);
  app.use(forceSSL);
  io.adapter(redisAdapter(config.redis.prod));
} else {
  app.set('trust proxy', config.express.dev.trustProxy);
  app.use(bodyParser.urlencoded(config.express.dev.bodyParser));
  sessionStore = new redisStore(config.redis.dev);
  io.adapter(redisAdapter(config.redis.dev));
}

// Configure sessions
let sessionConfig = Object.assign({}, {store: sessionStore}, config.session);
let session = expSession(sessionConfig);

app.use(session);
if(!sticky.listen(http, port)) {
  http.once('listening', () => {
    console.log('listening on localhost:' + port);
  });
} else {
    
    console.log('Sticky server started with id: ' + cluster.worker.id);

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

      if(req.session.user != undefined) {
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
          nsps[room].on('connection', connection.bind({nsps: nsps}));
          nsps[room].use((socket, next) => {
            session(socket.request, socket.request.res, next);
          });
        }

        res.sendFile(__dirname + '/public/room.html');

      } else {
        res.redirect(
          [req.headers['x-forwarded-proto'], req.get('Host'), req.url].join('')
        );
      }
    });

    app.post('/nick', (req, res) => {
      console.log('made it in /nick route');
      console.log(req.session);
      console.log(req.session.user);
      let args = req.body.cmd.split(/[ ,]+/).filter(Boolean);
      if (args.length == 2) {  
        req.session.user.nick = args[1];
        res.send(201);
      } else {
        res.send(500);
      }
    });

    app.get('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/');
    });

    app.get('/test', (req, res) => {
      res.sendFile(__dirname + '/public/test.html');
    });

    app.use(express.static('public'));

    //Handle sockets on empty room
    io.on('connection', connection);
    io.use((socket, next) => {
      session(socket.request, socket.request.res, next);
    });
}

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  process.exit();
});

process.on('exit', function() {
  for(key in nsps) {
    nsps[key].emit('cmd', {res:'SERVER IS DOWN, CANNOT CONNECT OR SEND MESSAGES.'});
  }
});
