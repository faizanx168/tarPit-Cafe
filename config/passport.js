const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const FacebookStrategy = require("passport-facebook");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.CLIENT_URL}/google/callback`,
        profileFields: ["id", "displayName", "email", "name"],
        state: true,
      },
      async function verify(accessToken, refreshToken, profile, done) {
        try {
          const user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            done(null, user);
          } else {
            const newUser = {
              email: profile.emails[0].value,
              username: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
            };
            const user = new User(newUser);
            await user.save();
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.CLIENT_URL}/facebook/callback`,
        profileFields: ["id", "displayName", "email", "name"],
        state: true,
      },
      async function verify(accessToken, refreshToken, profile, done) {
        try {
          const user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            done(null, user);
          } else {
            const newUser = {
              email: profile.emails[0].value,
              username: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
            };
            const user = new User(newUser);
            await user.save();
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, {
        _id: user._id,
        email: user.email,
        username: user.username,
        FirstName: user.firstName,
        LastName: user.lastName,
      });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};
