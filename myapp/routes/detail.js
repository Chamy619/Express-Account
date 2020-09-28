const express = require("express");
const router = express.Router();
const db = require("../conf/db");
const auth = require("../public/javascripts/auth");

router.get("/", function (req, res, next) {
  res.render("detail", {
    title: "Detail",
    name: req.user,
  });
});

router.post("/income/list", function (req, res, next) {
  db.query(
    "SELECT title, price, DATE_FORMAT(calen,'%Y-%m-%d') AS calen FROM income WHERE title=?",
    [req.body.title],
    function (err, lists) {
      if (err) {
        next(err);
      }
      var td = "";
      var money = 0;
      for (list in lists) {
        td += `<tr><td>${lists[list].title}</td><td>${lists[list].price}</td><td>${lists[list].calen}</td></tr>`;
        money += lists[list].price;
      }
      console.log(td);
      console.log(money);

      res.render("detail_list", {
        title: "Income Details",
        name: req.user,
        lists: td,
        balance: money,
      });
    }
  );
});

router.post("/outcome/list", function (req, res, next) {
  db.query(
    "SELECT title, price, DATE_FORMAT(calen,'%Y-%m-%d') AS calen FROM outcome WHERE title=?",
    [req.body.title],
    function (err, lists) {
      if (err) {
        next(err);
      }
      var td = "";
      var money = 0;
      for (list in lists) {
        td += `<tr><td>${lists[list].title}</td><td>${lists[list].price}</td><td>${lists[list].calen}</td></tr>`;
        money += lists[list].price;
      }
      console.log(td);
      console.log(money);

      res.render("detail_list", {
        title: "Outcome Details",
        name: req.user,
        lists: td,
        balance: money,
      });
    }
  );
});

router.get("/income/select", function (req, res, next) {
  db.query("SELECT DISTINCT title FROM income", function (err, titles) {
    if (err) {
      next(err);
    }
    var options = "";
    for (title in titles) {
      options += `<option>${titles[title].title}</option>`;
    }
    res.render("detail_income_select", {
      title: "Income Detail",
      name: req.user,
      options: options,
    });
  });
});

router.get("/outcome/select", function (req, res, next) {
  db.query("SELECT DISTINCT title FROM outcome", function (err, titles) {
    if (err) {
      next(err);
    }
    var options = "";
    for (title in titles) {
      options += `<option>${titles[title].title}</option>`;
    }
    res.render("detail_outcome_select", {
      title: "Outcome Detail",
      name: req.user,
      options: options,
    });
  });
});

module.exports = router;
