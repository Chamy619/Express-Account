const db = require("../../conf/db");
module.exports = function (req, res, next) {
  db.query(
    "SELECT SUM(income.price)-SUM(outcome.price) AS balance FROM income,outcome",
    [],
    function (err, bal) {
      if (err) {
        next(err);
      }
      return bal;
    }
  );
};
