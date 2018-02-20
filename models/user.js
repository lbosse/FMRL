var mongoose  = require('mongoose');
var crypto    = require('crypto');
var config    = require('../server.config');

if(process.env.NODE_ENV === 'production') {
  mongoose.connect(config.db.prod.uri);
} else {
  mongoose.connect(config.db.dev.uri);
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {});

var userSchema = mongoose.Schema({
  email: String,
  name: String,
  nick: String,
  password: String,
  active: Boolean
});

var User = mongoose.model('User', userSchema);

module.exports = User;
