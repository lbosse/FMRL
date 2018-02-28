module.exports = {
  express: {
    prod: {
      trustProxy: 1,
      bodyParser: { extended: true },
      store: {
        checkPeriod: 86400000 // prune expired entries every 24h
      }
    },
    dev: {
      trustProxy: 0,
      bodyParser: { extended: true },
      store: {
        checkPeriod: 86400000 // prune expired entries every 24h
      } 
    }
  },
  redis: {
    prod: {
      host: '',
      port: ''
    },
    dev: {
      host: 'localhost',
      port: '6379'
    }
  },
  session: {
    secret: 'blahblah1234@#$',
    unset: 'destroy',
    proxy: false,
    cookie: {secure: false, httpOnly: true},
    resave: true,
    saveUninitialized: true
  },
  mongo: {
    prod: {
      uri: '',
      useMongoClient: true,
      secret: 'blahblah1234@#$',
    },
    dev: {
      uri: 'mongodb://localhost/msg',
      useMongoClient: true,
      secret: 'blahblah1234@#$',
    }
  }
}
