var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');


//-------------Database configuration with Mongoose------------------------
// mongoose.connect('mongodb://localhost/loginapp');


var databaseUri = 'mongodb://localhost/loginapp';

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);

} else {

  mongoose.connect(databaseUri);
}


//-----------End Database config--------------------------------------------------------------
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error ', err);
});

db.once('open', function(err) {
  console.log("Mongoose connection successful.");
});

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//===============ROUTES=================


//displays where drafts can be read and commented on
app.get('/draft', function(req, res){
  res.render('draft');
});

//displays the frequently asked questions page
app.get('/faq', function(req, res){
  res.render('faq');
});

//displays the forum page
app.get('/forum', function(req, res){
  res.render('forum');
});

//displays the page where users can add thier story drafts
app.get('/addDraft', function(req, res){
  res.render('addDraft');
});



app.use('/', routes);
app.use('/users', users);




// Set Port
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});