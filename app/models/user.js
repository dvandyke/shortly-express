var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({});

User.encrypt = function(obj){
  bcrypt.hash(obj.password, null, null, function(err, hash){
    console.log(hash);
  })
};


module.exports = User;
