//Require modules
var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../models/User.js');
var orm = require('../config/orm.js');
var bcrypt = require('bcrypt-nodejs');


//====================LOCAL USER AUTHENTICATION=======================
passport.use(new LocalStrategy({passReqToCallback : true},
  function(req, username, password, done) {
  	//Searching the ORM for the user in the database
  	orm.findUser(username, function(err, user){
  		user = user[0];
  		if (err) {
  			return done(err)
  		}
      	if (!user) {
      		return done(null, false)
      	}
      	//comparing user passwords - return if not a match
      	if (bcrypt.compareSync(password, user.password) === false) {
      		return done(null, false)
     	 }
      	return done(null, user);
  	});
  }
));

//In order to provide persistent login sessions, Passport needs to be able to
//serialize users into the session and deserialize users out of the session.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//===============EXPORT MODULE HANDLING ROUTES =================
module.exports = function(app) {


//===========================AUTHENTICATE============================

app.post('/', 
  passport.authenticate('local', {
    successRedirect: '/authenticated', 
    failureRedirect: '/', 
    failureFlash: 'Invalid username or password' })
  );
