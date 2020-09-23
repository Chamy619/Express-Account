const express = require("express");
const router = express.Router();
const flash = require("connect-flash");

const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
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

const db = require("../conf/db");
const auth = require("../public/javascripts/auth");
const formCheck = require("../public/javascripts/formCheck");

router.use(flash());
router.use(bodyParser.urlencoded({ extended: false }));

var passport = require("../public/javascripts/passport")(router);

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
      title: "Woori Middle and High School Students Account",
      description: "This page is used by only woori church",
      name: req.user,
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

  if (!formCheck.registerCheck(req, res)) {
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
