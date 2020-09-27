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

router.get("/income", function (req, res, next) {
  db.query("SELECT * FROM income", function (err, lists) {
    //console.log(incomes);
    var listText = "";
    var balance = 0;
    for (list in lists) {
      listText += "<tr>";
      listText += "<td>";
      listText += lists[list].title;
      listText += "</td>";
      listText += "<td>";
      listText += lists[list].price;
      listText += "</td>";
      listText += "<td>";
      listText += lists[list].calen;
      listText += "</td></tr>";
      balance += lists[list].price;
    }

    res.render("detail_list", {
      title: "Income Detail",
      name: req.user,
      lists: listText,
      balance: balance,
    });
  });
});

module.exports = router;
