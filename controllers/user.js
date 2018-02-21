const mongoose        = require('mongoose');
const User            = require('../models/user');
const crypto          = require('crypto');
const config          = require('../server.config.js');
var uuidv4            = require('uuid/v4');

exports.getUserByEmail = function (email) {
  return User.findOne({email: email}).exec();
};

exports.createUser = function (uobj) {
  var newUser = new User(uobj);
  return newUser;
}

exports.hashPass = function (userData) {
  var hash = crypto.createHmac('sha512', 'rn59x@4es7q!');
  hash.update(userData.password);
  userData.password = hash.digest('hex');
  return userData;
}

exports.validPw = function (uobj) {
  var regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
  return regex.test(uobj.password);
}

exports.validEmail = function (uobj) {
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(uobj.email);
}
