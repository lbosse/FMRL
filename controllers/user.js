const mongoose        = require('mongoose');
const User            = require('../models/user');
const crypto          = require('crypto');
var uuidv4  = require('uuid/v4');

if(process.env.NODE_ENV === 'production') {
  connect = mongoose.connect(config.db.prod.uri, {useMongoClient: true});
} else {
  connect = mongoose.connect(config.db.dev.uri, {useMongoClient: true});
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));//USE MORGAN HERE
db.once('open', () => {});

function getUser(userData) {
  return db.findOne({email: userData.email}).exec();
};

function createUser(userData) {
  var outcome = {created: false, msg: ''};
  var user = db.findOne({email: userData.email}).exec().then((user) => {
    if(!user) {
      var uobj = Object.assign({ active: true }, userData);
      if(!validEmail(uobj)) {
        outcome.msg = 'Not a valid email.';
        return outcome;
      }
      if(!validPw(uobj)) {
        outcome.msg = 'Not a valid password.';
        return outcome;
      }
      if(uobj.password != uobj.passwordMatch) {
        outcome.msg = 'Passwords do not match.';
        return outcome;
      }

      uobj = hashPass(uobj);

      var newUser = new User(uobj); 
      newUser.save((err) => {
        if(err) throw err;
        outcome.msg = 'New user saved!';
        return outcome;
      });
    } else {
      outcome.msg = 'User already exists!';
      return outcome;
    }
  });
}

function hashPass(userData) {
  var hash = crypto.createHmac('sha512', 'rn59x@4es7q!');
  hash.update(userData.password);
  userData.password = hash.digest('hex');
  return userData;
}

function validPw(userData) {
  var regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
  return regex.test(userData.password);
}

function validEmail(userData) {
  var regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  return regex.test(userData.email);
}
