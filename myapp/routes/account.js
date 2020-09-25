const express = require("express");
const router = express.Router();
const db = require("../conf/db");
var auth = require("../public/javascripts/auth");

router.use(function (req, res, next) {
  if (!auth.isLogined(req, res)) {
    res.redirect("/");
  } else {
    next();
  }
});

router.get("/", function (req, res, next) {
  db.query(
    "SELECT (SELECT SUM(price) FROM income)-(SELECT SUM(price) FROM outcome) AS balance",
    function (err, bal) {
      if (err) {
        next(err);
      }
      res.render("account", {
        title: "Account",
        name: req.user,
        balance: bal[0].balance,
      });
    }
  );
});

router.get("/income", function (req, res, next) {
  res.render("income", {
    title: "Income",
    name: req.user,
    ptitle: "",
    pprice: "",
    pcalen: "",
  });
});

router.get("/outcome", function (req, res, next) {
  res.render("outcome", {
    title: "Outcome",
    name: req.user,
    ptitle: "",
    ptarget: "",
    pprice: "",
    pcalen: "",
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

router.get("/list/:pageNum", function (req, res, next) {
  console.log(req.params.pageNum);
  var pageNum = req.params.pageNum;
  db.query(
    `(SELECT id,1 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM income) UNION (SELECT id,2 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM outcome) order by calen`,
    function (err, lists) {
      if (err) {
        next(err);
      }

      var page = parseInt(lists.length / 10);
      if (lists.length % 10 !== 0) {
        page += 1;
      }

      var pageList = "";
      for (i = 1; i <= page; i++) {
        pageList += `|<a href=/account/list/${i}>${i}</a>|`;
      }

      var table_list = "";
      for (var i = (pageNum - 1) * 10; i < (pageNum - 1) * 10 + 10; i++) {
        var type = "입금";
        var action = "income";
        if (lists[i] === undefined) {
          break;
        }
        if (lists[i].type === 2) {
          type = "출금";
          action = "outcome";
        }
        table_list += "<tr>";
        table_list += "<td>" + type + "</td>";
        table_list += "<td>" + lists[i].title + "</td>";
        table_list += "<td>" + lists[i].price + "</td>";
        table_list += "<td>" + lists[i].calen + "</td>";
        table_list += `<td><form action='/account/update/${action}/${lists[i].id}' method='post'><input type='hidden' name='type' value='${lists[i].type}'><input type='submit' value='update'></form></td>`;
        table_list += `<td><form action='/account/delete/${action}/${lists[i].id}' method='get'><input type='submit' value='delete'></form></td>`;
        table_list += "</tr>\n";
      }

      db.query(
        "SELECT (SELECT SUM(price) FROM income)-(SELECT SUM(price) FROM outcome) AS balance",
        function (err, bal) {
          if (err) {
            next(err);
          }
          res.render("list", {
            name: req.user,
            title: "List",
            lists: table_list,
            balance: bal[0].balance,
            page: pageList,
          });
        }
      );
    }
  );
});

router.post("/update/:action/:id", function (req, res, next) {
  var sql = "SELECT * FROM " + req.params.action + " WHERE id = ?";
  db.query(sql, [req.params.id], function (err, row) {
    if (err) {
      next(err);
    }
    var date = new Date(row[0].calen);
    var date_form =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    res.render(req.params.action + "-update", {
      name: req.user,
      title: "Update",
      id: req.params.id,
      ptitle: row[0].title,
      pprice: row[0].price,
      ptarget: row[0].target,
      pcalen: date_form,
    });
  });
});

router.post("/update/:action/:id/process", function (req, res, next) {
  const calen = new Date(req.body.date).toLocaleDateString();
  var sql = "UPDATE " + req.params.action + " SET title=?, price=?, calen=?";
  if (req.params.action === "outcome") {
    sql += ", target=? WHERE id=?";
    db.query(
      sql,
      [req.body.title, req.body.price, calen, req.body.target, req.params.id],
      function (err, result) {
        if (err) {
          next(err);
        }
        res.redirect("/account/list/1");
      }
    );
  } else {
    sql += " WHERE id=?";
    db.query(
      sql,
      [req.body.title, req.body.price, calen, req.params.id],
      function (err, result) {
        if (err) {
          next(err);
        }
        res.redirect("/account/list/1");
      }
    );
  }
});

router.get("/delete/:action/:id", function (req, res, next) {
  var sql = "DELETE FROM " + req.params.action + " WHERE id=?";
  db.query(sql, [req.params.id], function (err, result) {
    res.redirect("/account/list/1");
  });
});

module.exports = router;
