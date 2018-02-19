var userSchema = mongoose.Schema({
  email: String,
  name: String,
  nick: String,
  password: String,
  active: Boolean
});

var User = mongoose.model('User', userSchema);

module.exports = User;
