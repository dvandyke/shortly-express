var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({});

User.encrypt = function(obj){
  // bcrypt.hash(obj.password, null, null, function(err, hash){
  //   console.log('data': hash);
  // })

  //create salt
  bcrypt.genSalt(10, function(err, salt){
    var temp = salt;
    //create hash
    bcrypt.hash(obj.password, temp, null, function(error, hash){
      console.log('salt:',temp);
      console.log('hash:',hash);
      if (error){
        console.log(error);
      } else {
        console.log(db);
        // db.knex('users').insert({id: null, username: obj.username, password: hash, salt: temp})
      }
    });
  });
};


module.exports = User;
