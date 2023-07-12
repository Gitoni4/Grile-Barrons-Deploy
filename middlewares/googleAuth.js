const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


module.exports = (passport) => {
  passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let checkUser = await User.findOne({ googleId: profile.id })
        if (checkUser) {
          return done(null, checkUser)
        } else {
          const newUser = ({
            username: profile.id,
            password: "googleAuthPassword",
            googleId: profile.id,
            email: profile._json.email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            profilePhoto: profile._json.picture
          })

          checkUser = await User.create(newUser);
          done(null, User)
        }
      } catch (error) {
        console.log(error)
      }
    }
  ));
  passport.serializeUser(function (user, done) {
    done(null, user.googleId)
  }) 
  passport.deserializeUser(function (user, done) {
    User.findById(googleId, function (err, user) {
      done(null, user)
    })
  })
}