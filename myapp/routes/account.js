const express = require("express");
const router = express.Router();
const db = require("../conf/db");

router.get("/", function (req, res, next) {
  res.render("account", {
    title: "Account",
    name: req.user,
  });
});

router.get("/income", function (req, res, next) {
  res.render("income", {
    title: "Income",
    name: req.user,
  });
});

router.get("/outcome", function (req, res, next) {
  res.render("outcome", {
    title: "Outcome",
    name: req.user,
  });
});

router.post("/income/process", function (req, res, next) {
  const calen = new Date(req.body.date).toLocaleDateString();
  db.query(
    "INSERT INTO income VALUES(null, ?, ?, ?)",
    [req.body.title, req.body.price, calen],
    function (err, result) {
      if (err) {
        next(err);
      }
      res.redirect("/account");
    }
  );
});

router.post("/outcome/process", function (req, res, next) {
  const calen = new Date(req.body.date).toLocaleDateString();
  db.query(
    "INSERT INTO outcome VALUES(null, ?, ?, ?, ?)",
    [req.body.title, req.body.target, req.body.price, calen],
    function (err, result) {
      if (err) {
        next(err);
      }
      res.redirect("/account");
    }
  );
});

module.exports = router;
