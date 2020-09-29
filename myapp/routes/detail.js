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

      res.render("detail_income_list", {
        title: "Income Details",
        name: req.user,
        lists: td,
        balance: money,
        sort: 1,
        col: req.body.title,
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

      res.render("detail_outcome_list", {
        title: "Outcome Details",
        name: req.user,
        lists: td,
        balance: money,
        sort: 1,
        col: req.body.title,
      });
    }
  );
});

router.get("/income/select", function (req, res, next) {
  db.query(
    "SELECT title, SUM(price) AS price FROM income GROUP BY title",
    function (err, titles) {
      if (err) {
        next(err);
      }
      var options = "";
      var lists = "";
      var money = 0;
      for (title in titles) {
        lists += `<tr><td>${titles[title].title}</td><td>${titles[title].price}</td></tr>`;
        money += titles[title].price;
        options += `<option>${titles[title].title}</option>`;
      }
      res.render("detail_income_select", {
        title: "Income Detail",
        lists: lists,
        balance: money,
        name: req.user,
        options: options,
      });
    }
  );
});

router.get("/outcome/select", function (req, res, next) {
  db.query(
    "SELECT title, SUM(price) AS price FROM outcome GROUP BY title",
    function (err, titles) {
      if (err) {
        next(err);
      }
      var options = "";
      var lists = "";
      var money = 0;
      for (title in titles) {
        lists += `<tr><td>${titles[title].title}</td><td>${titles[title].price}</td></tr>`;
        money += titles[title].price;
        options += `<option>${titles[title].title}</option>`;
      }
      res.render("detail_outcome_select", {
        title: "Outcome Detail",
        lists: lists,
        balance: money,
        name: req.user,
        options: options,
      });
    }
  );
});

router.get("/income/:title/:column/:sort", function (req, res, next) {
  var DESC = "";
  if (req.params.sort === "-1") {
    DESC = " DESC";
  }
  var sql = `SELECT title, price, DATE_FORMAT(calen,'%Y-%m-%d') AS calen FROM income WHERE title='${req.params.title}' ORDER BY ${req.params.column} ${DESC}`;
  db.query(sql, function (err, rows) {
    if (err) {
      next(err);
    }
    var lists = "";
    var balance = 0;
    for (row in rows) {
      lists += `<tr><td>${rows[row].title}</td><td>${rows[row].price}</td><td>${rows[row].calen}</td></tr>`;
      balance += rows[row].price;
    }

    res.render("detail_income_list", {
      title: "Income Detail",
      name: req.user,
      lists: lists,
      balance: balance,
      sort: -req.params.sort,
      col: req.params.title,
    });
  });
});

router.get("/outcome/:title/:column/:sort", function (req, res, next) {
  var DESC = "";
  if (req.params.sort === "-1") {
    DESC = " DESC";
  }
  var sql = `SELECT title, price, DATE_FORMAT(calen,'%Y-%m-%d') AS calen FROM outcome WHERE title='${req.params.title}' ORDER BY ${req.params.column} ${DESC}`;
  db.query(sql, function (err, rows) {
    if (err) {
      next(err);
    }
    var lists = "";
    var balance = 0;
    for (row in rows) {
      lists += `<tr><td>${rows[row].title}</td><td>${rows[row].price}</td><td>${rows[row].calen}</td></tr>`;
      balance += rows[row].price;
    }

    res.render("detail_outcome_list", {
      title: "Outcome Detail",
      name: req.user,
      lists: lists,
      balance: balance,
      sort: -req.params.sort,
      col: req.params.title,
    });
  });
});

module.exports = router;
