var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users'
});

User.encrypt = function(obj){
  bcrypt.hash(obj.password, null, null, function(err, hash){
    User.forge({id: null, username: obj.username, saltPass: hash}).save();
  })
};

User.authenticate = function(reqBodyPass, salt, callback){
  bcrypt.compare(reqBodyPass, salt, function(err, res){
    err ? callback(err) : callback(res);
  });
};

module.exports = User;
