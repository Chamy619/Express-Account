const db = require("../../conf/db");
const bcryptjs = require("bcryptjs");

module.exports = function (router) {
  var passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

  router.use(passport.initialize());
  router.use(passport.session());

  passport.serializeUser(function (user, done) {
    console.log("serializeUser", user);
    return done(null, user.user_id);
  });

  passport.deserializeUser(function (id, done) {
    console.log("deserializeUser", id);
    db.query("SELECT * FROM users WHERE user_id=?", [id], function (
      error,
      user
    ) {
      if (error) {
        next();
      }
      if (user.length === 0) {
        return done(null, false, { message: "Incorrect session" });
      } else {
        done(null, user[0].user_id);
      }
    });
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "id",
        passwordField: "pwd",
      },
      function (username, password, done) {
        db.query("SELECT * FROM users WHERE user_id=?", [username], function (
          error,
          user
        ) {
          if (error) {
            next(error);
          } else {
            if (user.length === 0) {
              return done(null, false, { message: "Incorrect username." });
            } else {
              bcryptjs.compare(password, user[0].pwd, function (err, result) {
                if (result) {
                  return done(null, user[0]);
                } else {
                  return done(null, false, { message: "Incorrect password" });
                }
              });
            }
          }
        });
      }
    )
  );

  return passport;
};
