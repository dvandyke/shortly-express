var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users'
});

User.encrypt = function(obj){
  bcrypt.hash(obj.password, null, null, function(err, hash){
    return hash;
  })

  //create salt
  // bcrypt.genSalt(10, function(err, salt){
  //   var temp = salt;
  //   //create hash
  //   bcrypt.hash(obj.password, temp, null, function(error, hash){
  //     console.log('salt:',temp);
  //     console.log('hash:',hash);
  //     if (error){
  //       console.log(error);
  //     } else {
  //       //TODO: Access collection to save to database
  //       console.log(db.Collection.__super__);
  //       // db.knex('users').insert({id: null, username: obj.username, password: hash, salt: temp})
  //     }
  //   });
  // });
};


module.exports = User;
