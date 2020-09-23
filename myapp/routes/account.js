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

router.get("/list", function (req, res, next) {
  db.query(
    "(SELECT id,1 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM income) UNION (SELECT id,2 AS type,DATE_FORMAT(calen,'%Y-%m-%d') AS calen, title, price FROM outcome) order by calen",
    function (err, lists) {
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

      res.render("list", {
        name: req.user,
        title: "List",
        lists: table_list,
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
    console.log(date_form);
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
  console.log("form:", req.body);
  var sql = "UPDATE " + req.params.action + " SET title=?, price=?, calen=?";
  if (req.params.action === "outcome") {
    console.log(sql);
    sql += ", target=? WHERE id=?";
    db.query(
      sql,
      [req.body.title, req.body.price, calen, req.body.target, req.params.id],
      function (err, result) {
        if (err) {
          next(err);
        }
        console.log(
          req.body.title,
          req.body.price,
          calen,
          req.body.target,
          req.params.id
        );
        console.log(result);
        res.redirect("/account/list");
      }
    );
  } else {
    sql += " WHERE id=?";
    db.query(
      sql,
      [req.body.title, req.body.price, calen, req.params.id],
      function (err, result) {
        console.log(sql);
        if (err) {
          next(err);
        }
        console.log(req.body.title, req.body.price, calen, req.params.id);
        console.log(result);
        res.redirect("/account/list");
      }
    );
  }
});

router.get("/delete/:action/:id", function (req, res, next) {
  console.log(req.params);
  var sql = "DELETE FROM " + req.params.action + " WHERE id=?";
  console.log(sql);
  db.query(sql, [req.params.id], function (err, result) {
    res.redirect("/account/list");
  });
});

module.exports = router;
