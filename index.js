const express = require("express");
const { mkdirSync } = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const jwtsecret = "hellothisismikha";
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5500", // Replace with your frontend's URL
  })
);
app.get("/", (req, res) => {
  res.sendFile(
    "/mnt/d/cohort3/webdev/http/express-practice/authentication/public/index.html"
  );
});
function auth(req, res, next) {
  const token = req.headers.authroization;
  if (token) {
    jwt.verify(token, jwtsecret, (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: "unauthorized4",
          err: err,
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send({
      message: "unatuhtorized1",
    });
  }
}

const users = [];
const todos = [];

app.post("/signup", (req, res) => {
  const username = req.body.username;
  const pswd = req.body.pswd;

  const user = users.find((user) => user.username == username);

  if (user) {
    res.status(401).send({
      message: "user already exist",
    });
  } else {
    users.push({
      username: username,
      pswd: pswd,
    });
    res.send({
      message: "You have signed up",
    });
  }
});
app.post("/signin", (req, res) => {
  const username = req.body.username;
  const pswd = req.body.pswd;

  const user = users.find(
    (user) => user.username === username && user.pswd === pswd
  );
  if (user) {
    const token = jwt.sign({ username: user.username }, jwtsecret);
    user.token = token;
    res.send({
      token,
    });
  } else {
    res.status(401).send({
      message: "unauthorized",
    });
  }
});
//app.use(auth);
app.get("/me", auth, (req, res) => {
  const user = req.user;
  if (user) {
    res.send({
      username: user.username,
    });
  } else {
    res.status(401).send({
      message: "unauthorized2",
    });
  }
});

app.get("/todos", (req, res) => {});
app.post("/addtodo", (req, res) => {});
app.delete("/deltodo", (req, res) => {});
app.put("/update", (req, res) => {});

app.listen(3000);
