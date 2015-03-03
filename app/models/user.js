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

User.authenticate = function(obj){
  //Database query for User Hash
  var success = false;
  new User({'username':obj.username}).fetch().then(function(model){
    //Compare salts
    return bcrypt.compare(obj.password, model.get('saltPass'), function(err, res){
    });
  }).then(function(val){
    console.log('promise value:',val);
  });
};

module.exports = User;
