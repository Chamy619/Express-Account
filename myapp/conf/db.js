const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "woori",
  port: "3307",
});
db.connect();
module.exports = db;
