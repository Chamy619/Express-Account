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

router.get("/list/:pageNum/:col/:sort", function (req, res, next) {
  var pageNum = req.params.pageNum;
  var or_col = req.params.col;
  var sorting = req.params.sort;
  var desc = " ";
  if (sorting === "-1") {
    desc = " DESC ";
  }
  db.query(
    "SELECT COUNT(id) AS num FROM income UNION SELECT COUNT(id) FROM outcome",
    function (err, numbers) {
      if (err) {
        next(err);
      }
      var total = numbers[0].num + numbers[1].num;

      var page = parseInt(total / 10);
      if (total % 10 !== 0) {
        page += 1;
      }

      var pageList = "";
      for (i = 1; i <= page; i++) {
        if (i == pageNum) {
          pageList += `|${i}|`;
        } else {
          pageList += `|<a href=/account/list/${i}/${or_col}/${sorting}>${i}</a>|`;
        }
      }
      var start = (pageNum - 1) * 10;
      var sql =
        `(SELECT id,1 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM income) UNION (SELECT id,2 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM outcome) order by ${or_col}` +
        desc +
        `limit ${start}, 10`;
      db.query(sql, function (err, lists) {
        if (err) {
          next(err);
        }
        var table_list = "";
        for (list in lists) {
          var type = "입금";
          var action = "income";
          if (lists[list].type === 2) {
            type = "출금";
            action = "outcome";
          }
          table_list += "<tr>";
          table_list += "<td>" + type + "</td>";
          table_list += "<td>" + lists[list].title + "</td>";
          table_list += "<td>" + lists[list].price + "</td>";
          table_list += "<td>" + lists[list].calen + "</td>";
          table_list += `<td><form action='/account/update/${action}/${lists[list].id}' method='post'><input type='hidden' name='type' value='${lists[list].type}'><input type='submit' value='update'></form></td>`;
          table_list += `<td><form action='/account/delete/${action}/${lists[list].id}' method='get'><input type='submit' value='delete'></form></td>`;
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
              sort: -sorting,
            });
          }
        );
      });
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
