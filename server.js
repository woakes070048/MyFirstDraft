//Dependecies
var express = require('express');
var exphbs = require('express-handlebars');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var connection = require('./config/connection.js');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local');
var twitterStrategy = require('passport-twitter');
var facebookStrategy = require('passport-facebook');
var googleStrategy = require('passport-google');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var app = express();

//============== NOTE: not sure if both of these are needed ===================
//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));

// BodyParser interprets data sent to the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

// cookie parser for user authentication
app.use(cookieParser());
// session configuration
app.use(session({
	secret: 'myfirstdraft',
	cookie: { maxAge: 100000 },
	resave: true,
	saveUninitialized: true,
 } ));

//flash is used to show a message on an incorrect login
app.use(flash());

// use passport authentication middleware 
app.use(passport.initialize());
app.use(passport.session());


//===============EXPRESS================
// Configure Express
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main', //we will be creating this layout shortly
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


//===========PORT=====================

var PORT = process.env.PORT || 8000;

app.listen(PORT, function() {
    console.log("Listening on %d", PORT);
});
