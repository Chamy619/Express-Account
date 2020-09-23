const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const flash = require("connect-flash");
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
const db = require("../conf/db");
const auth = require("../public/javascripts/auth.js");

var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

var options = {
  host: "localhost",
  port: 3307,
  user: "root",
  password: "111111",
  database: "woori",
};

var sessionStore = new MySQLStore(options);

router.use(
  session({
    secret: "asdfzxcvqwerpou",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

passport.serializeUser(function (user, done) {
  console.log("serializeUser", user);
  return done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
  console.log("deserializeUser", id);
  db.query("SELECT * FROM users WHERE user_id=?", [id], function (error, user) {
    if (error) {
      next();
    }
    if (user.length === 0) {
      return done(null, false, { message: "Incorrect session" });
    } else {
      done(null, user);
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

router.post("/login/process", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);
});

router.get("/", function (req, res, next) {
  console.log("home", req.user);
  if (auth.isLogined(req, res)) {
    res.render("index", {
      title: "Express123",
      description: "Express is ...",
    });
  } else {
    var fmsg = req.flash();
    var text = "";
    if (fmsg.error) {
      text = fmsg.error;
    }
    res.render("login", { flash: text });
  }
});

router.get("/create", function (req, res, next) {
  var fmsg = req.flash();
  var text = "";
  if (fmsg.error) {
    text = fmsg.error;
  }
  res.render("register", { flash: text });
});

router.post("/create/process", function (req, res, next) {
  const id = req.body.id;
  const pw1 = req.body.pwd;
  const pw2 = req.body.pwd2;

  if (id === "") {
    req.flash("error", "Must type your ID!!!");
    res.redirect("/create");
  } else if (pw1 === "" || pw2 === "") {
    req.flash("error", "Must type your PW!!!");
    res.redirect("/create");
  } else if (pw1 !== pw2) {
    req.flash("error", "PW must same!!!");
    res.redirect("/create");
  } else {
    db.query("SELECT * FROM users WHERE user_id=?", [id], function (
      error,
      user
    ) {
      if (error) {
        res.send(404, error);
      }
      if (user.length !== 0) {
        req.flash("error", "Change your ID!!!");
        res.redirect("/create");
      } else {
        bcryptjs.hash(pw1, 10, function (err, hash) {
          if (err) {
            next(err);
          } else {
            db.query(
              "INSERT INTO users VALUES(null, ?, ?)",
              [id, hash],
              function (error2, result) {
                if (error2) {
                  next(error2);
                } else {
                  res.redirect("/");
                }
              }
            );
          }
        });
      }
    });
  }
});

router.get("/logout", function (req, res, next) {
  req.logout();
  req.session.save(function (err) {
    res.redirect("/");
  });
});

module.exports = router;
