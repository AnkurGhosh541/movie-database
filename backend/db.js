const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "system",
  database: "movie_database",
});

con.connect(err => {
  if (err) {
    throw err;
  }
});

module.exports = con;
