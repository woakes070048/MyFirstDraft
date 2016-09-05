//Require modules
var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../models/User.js');
var orm = require('../config/orm.js');
var bcrypt = require('bcrypt-nodejs');

//====================GITHUB USER AUTHENTICATION=======================
//Github application credentials to use with passport js authentication
var GITHUB_CLIENT_ID = "bfa0c6c5da9631cd99b2";
var GITHUB_CLIENT_SECRET = "8ebca61bbcf3af0bca8f1eb96d848f72d76ab180";

// use the GitHubStrategy within Passport
// strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and GitHub
// profile), and invoke a callback function with a user object which can
// be used to display the user information within the handlebars page
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8080/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
      // The user's GitHub profile is returned to
      // represent the logged-in user. Still need to add the
      // GitHub account within a user record in the database,
      // and return that user from the database instead

      // console.log(profile)
    return done(null, profile);
  });
}));

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


//===========================USER LOGIN ROUTES============================
	app.get('/login', function(req, res){
		//adding new session property which can be accessed by other routes
		req.session.addnew = 'adding_new';

		res.render('login', {
			actionBtn: 'signin',
			message: req.flash('error')[0],
			otherAction: "register",
			action: "Sign in",
			alternative: "Create account",
		});
	});

	//signup page route
	app.get('/register', function(req, res){
		res.render('login', {
			actionBtn: 'register',
			otherAction: "signin",
			action: "Register",
			alternative: "Already have an Account? Login"
		});
	});

	//redirect /signin route to /login
	app.get('/signin', function(req, res){
		res.redirect('/login')
	});

	//logout page route which redirects back to /login after user logout
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/login');
	});

//===========================PAGE RENDERING ROUTES============================
	app.get('/', function(req, res) {

			res.render('index');
   	});

	//route for the applicant quiz/survey: passing in the authenticateUser middleware
	//to ensure persistent login sessions, which means that the user has to be logged in
	//to view this route. If the user is not logged in, they will be redirected to /login
   	app.get('/apps', authenticateUser, function(req, res) {

			console.log(req.session)
			res.render('applicant');
   	});

   	app.get('/admin', function(req, res) {
   		orm.viewAll('skills').then(function(data){
   			console.log(data);
   			res.render('admin', {
   				skills: data
   			});
   		});
   	});

	app.get('/adminLogin', function(req,res) {
   			res.render('adminLogin', {
			welcomeText: "Admin Authentication Login",
			message: req.flash('error')[0]
		});
   	})
   	
   	// Get user info for admin page when table row is clicked
   	app.get('/userInfo/:id', function(req,res) {
   		var userID = req.params.id;
   		console.log(userID);
   		orm.userInfo(userID).then(function(data) {
   			console.log(data)
   			res.send(data);
   		});
   	})

   	app.get('/applicant2', function(req,res) {
   		res.render('applicant2');
   	})

   	// /*This route is just grabbing the user info (Name and personal info)and the I chose to redirect
   	// to the home page. I assume we will work something out instead with the login page later.*/
   	// app.post('/createUser', function(req, res){
   	// 	orm.addUserToDB('users').then(function(data){
   	// 		console.log(data);
   	// 		res.redirect('/')
   	// 	})
   	// });

   	/*This route is just grabbing the actual user data (skills and culture quiz data)*/
   	app.post('/createSkills', function(req, res){
   			console.log("Hello " + req.body.CSS);
   		orm.addSkillsToDB('skills', req.body.first_name, req.body.last_name, req.body.email, req.body.address, req.body.phone_number, req.body.linkedin, req.body.github, req.body.CSS, req.body.HTML, req.body.Ruby_Rails, req.body.Java, req.body.Javascript, req.body.MySQL, req.body.React, req.body.PHP, req.body.Groovy_Grails, req.body.C_plus_plus, req.body.others).then(function(data){
   			console.log("Please not be undefined " + data);
   			res.redirect('/applicant2');
   		})
   	});

   	//=======================Need app.post
	app.post('/score', function(req, res) {
    		console.log("YO YO BRO" + req.body.personality_type);
    	orm.addScoreToDB('scores', req.body.personality_type).then(function(data){
    		console.log(data);
    		res.redirect('/profile');
    	})
        //if (err) throw err;
        //res.redirect('/');
    });
// });
	//   Simple route middleware to ensure user is authenticated between pages
	//   Use this route middleware for any routes that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function authenticateUser(req, res, next) {
	  	// if user is authenticated in the session, go to the next middleware
	  	if (req.isAuthenticated()) { return next(); }
     		// if user is not authenticated, redirect them to the home page
	  	res.redirect('/login');
	}
//===========================POST Routes============================
	//signin post route: if successful redirect to /authenticated
	//if unsuccessful redirect back to /login
	app.post('/signin', passport.authenticate('local',
		{failureRedirect:'/login', failureFlash:'Wrong Username or Password'}),
		function(req, res) {
			res.redirect('/apps');
		});

	//signup post route: creates a new user using the user model object
	app.post('/register', function(req, res){
		var user = new UserModel(req.body);
		UserModel.saveUser(user, function(status){
			if(!status) {
				res.redirect('/register');
				return false
			}
			res.redirect('/login');
		});
	});

};