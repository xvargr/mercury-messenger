import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ExpressError from "./ExpressError.js";

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username }, function (err, user) {
      if (err) throw new ExpressError(err, 500); // there is an error
      if (!user)
        return done(null, false, { message: "Wrong username or password" }); // no user by that username, null error, false user
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) throw new ExpressError(err, 500);
        if (result === true) {
          return done(null, user); // authenticated
        } else {
          return done(null, false, { message: "Wrong username or password" }); // wrong password
        }
      });
    });
  })
);

export default passport;
