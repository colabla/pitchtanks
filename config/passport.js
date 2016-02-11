'use strict';

const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

// load the auth variables
const configAuth = require('./auth');

const getNames = (name) => {
  const n = name.split(' ');
  return {
    first: n.shift(),
    last: n.length ? n.join(' ') : '',
  };
};

module.exports = (passport, db) => {
  // load up the user model
  const User = db.User;

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // code for login (use('local-login', new LocalStategy))
  // code for signup (use('local-signup', new LocalStategy))

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,

  },

  // facebook will send back the token and profile
  (token, refreshToken, profile, done) => {
    console.log(profile);
    // asynchronous
    process.nextTick(() => {
      // find the user in the database based on their facebook id
      User.findOne({ 'facebook.id': profile.id }, (err, user) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          return done(err);
        }
        // if the user is found, then log them in
        if (user) {
          return done(null, user); // user found, return that user
        }

        // Check for bad response
        if (!profile.displayName) {
          console.log(profile);
          return done(profile);
        }

        // if there is no user found with that facebook id, create them
        const newUser = new User();
        /*
        **  set all of the facebook information in our user model
        */
        const names = getNames(profile.displayName);

        // set the users facebook id
        newUser.facebook.id = profile.id;

        // look at the passport user profile to see how names are returned
        newUser.firstName = names.first;
        newUser.lastName = names.last;
        // facebook can return multiple emails so we'll take the first
        if (profile.emails && profile.emails.length) {
          newUser.facebook.email = profile.emails[0].value;
        }
        // save our user to the database
        newUser.save((err) => {
          if (err) {
            throw err;
          }

          // if successful, return the new user
          return done(null, newUser);
        });
      });
    });
  }));

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({

    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,

  },
  (token, tokenSecret, profile, done) => {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(() => {
      User.findOne({ 'twitter.id': profile.id }, (err, user) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          return done(err);
        }

        // if the user is found then log them in
        if (user) {
          return done(null, user); // user found, return that user
        }

        // Catch bad response
        if (!profile.name) {
          console.log(profile);
          return done(profile);
        }

        // if there is no user, create them
        const newUser = new User();
        const names = getNames(profile.name);

        // set all of the user data that we need
        newUser.twitter.id = profile.id;
        newUser.firstName = names.first;
        newUser.lastName = names.last;

        // save our user into the database
        newUser.save((err) => {
          if (err) {
            throw err;
          }
          return done(null, newUser);
        });
      });
    });
  }));

  // =========================================================================
  // LINKEDIN ================================================================
  // =========================================================================
  passport.use(new LinkedInStrategy({

    consumerKey: configAuth.linkedInAuth.consumerKey,
    consumerSecret: configAuth.linkedInAuth.consumerSecret,
    callbackURL: configAuth.linkedInAuth.callbackURL,

  },
  (token, tokenSecret, profile, done) => {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(() => {
      User.findOne({ 'linkedIn.id': profile.id }, (err, user) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          return done(err);
        }

        // if the user is found then log them in
        if (user) {
          return done(null, user); // user found, return that user
        }

        // Catch bad response
        if (!profile.name) {
          console.log(profile);
          return done(profile);
        }

        // if there is no user, create them
        const newUser = new User();

        // set all of the user data that we need
        newUser.linkedIn.id = profile.id;
        newUser.firstName = profile.name.givenName;
        newUser.lastName = profile.name.familyName;

        // save our user into the database
        newUser.save((err) => {
          if (err) {
            throw err;
          }
          return done(null, newUser);
        });
      });
    });
  }));
};
