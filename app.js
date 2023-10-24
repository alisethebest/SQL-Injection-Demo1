// Required modules
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// Setup Express app
const app = express();
app.use(express.static("."));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create an SQLite database in memory
const db = new sqlite3.Database(":memory:");

// Create and populate the mock database
db.serialize(function () {
  db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
  db.run(
    "INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')"
  );
});

// Route to serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// POST route for the login form
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Unsafe SQL query (for demonstration purposes)
  const query =
    "SELECT title FROM user WHERE username = '" +
    username +
    "' AND password = '" +
    password +
    "'";

  // Log values
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("Query:", query);

  db.get(query, function (err, row) {
    if (err) {
      console.log("ERROR", err);
      res.redirect("/index.html#error");
    } else if (!row) {
      res.redirect("/index.html#unauthorized");
    } else {
      res.send(
        "Hello <b>" +
          row.title +
          '</b><br />This file contains all your secret data: <br /><br />SECRETS <br /><br />MORE SECRETS <br /><br /><a href="/index.html">Go back to login</a>'
      );
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/");
});
