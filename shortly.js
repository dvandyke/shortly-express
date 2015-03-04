var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Implementing Sessions
// TODO: Extend sessions to get requests and routes
app.use(session(
  { secret: 'shortly secret shoes', cookie: {maxAge: 30000} }
));

var sess;

app.get('/',
function(req, res) {
  if (req.session.user){
    //Cookie Session
    req.session.regenerate(function(err){
      console.log('Index Route Error:', err);
    });
    res.render('index');
  } else {
    res.render('login')
  }
});

app.get('/create',
  function(req, res) {
    res.render('index');
});

// Logout
app.get('/logout',
  function(req, res){
   req.session.destroy(function(err){
    err ? console.log(err) : console.log('bye!');
    res.redirect('login');
   });
  })

// Routing request to create accounts to signup.ejs
app.get('/signup',
function(req,res) {
  res.render('signup');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
  function(req, res){
    User.encrypt(req.body);
    res.render('index');
    // User.forge({id: null, username: req.body.username, saltPass: userHash}).save();
  });

app.get('/login',
  function(req, res) {
    res.render('login');
});

app.post('/login',
  function(req, res){
    sess = req.session;
    var loginUser = new User({'username':req.body.username}).fetch().then(function(model){

    //Compare salts
    var saltPass = model.get('saltPass');
    User.authenticate(req.body.password, saltPass, function(val){
      if (val){
        //Cookie Session
        util.newSession(req, res, loginUser);
        sess.username = req.body.username;
      } else {
        res.render('login');
      }
    });

  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
