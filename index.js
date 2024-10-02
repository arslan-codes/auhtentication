const express = require("express");
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

let users = [];

function auth(req, res, next) {
  const token = req.headers.authorization; // Fix typo
  if (token) {
    jwt.verify(token, jwtsecret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized",
          err: err,
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(401).send({ message: "Unauthorized" });
  }
}

app.post("/signup", (req, res) => {
  const { username, pswd } = req.body;
  const user = users.find((user) => user.username === username);
  if (user) {
    return res.status(401).send({ message: "User already exists" });
  }

  users.push({
    username: username,
    pswd: pswd,
    todos: [], // Initialize todos array
  });

  res.send({ message: "You have signed up" });
});

app.post("/signin", (req, res) => {
  const { username, pswd } = req.body;
  const user = users.find(
    (user) => user.username === username && user.pswd === pswd
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, jwtsecret, {
      expiresIn: "1h",
    });
    res.send({ token });
  } else {
    res.status(401).send({ message: "Invalid username or password" });
  }
});

app.use(auth);

app.get("/me", auth, (req, res) => {
  res.send({ username: req.user.username });
});

app.get("/todos", (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
  if (user) {
    res.status(200).send({ todos: user.todos });
  } else {
    res.status(404).send({ message: "No todos found" });
  }
});

app.post("/addtodo", (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
  const { title, task } = req.body;
  if (user && title && task) {
    user.todos.push({ title, task });
    res.status(200).send({ message: "Todo added", todos: user.todos });
  } else {
    res.status(400).send({ message: "Invalid data" });
  }
});

app.put("/update", (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
  const { oldtask, newtask } = req.body;
  if (user) {
    const todo = user.todos.find((todo) => todo.task === oldtask);
    if (todo) {
      todo.task = newtask;
      res.status(200).send({ message: "Todo updated", todos: user.todos });
    } else {
      res.status(404).send({ message: "Todo does not exist" });
    }
  } else {
    res.status(400).send({ message: "Invalid request" });
  }
});

app.delete("/deltodo", (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
  const { task } = req.body;
  if (user) {
    const initialLength = user.todos.length;
    user.todos = user.todos.filter((todo) => todo.task !== task);
    if (initialLength !== user.todos.length) {
      res.status(200).send({ message: "Todo deleted", todos: user.todos });
    } else {
      res.status(404).send({ message: "Todo not found" });
    }
  } else {
    res.status(400).send({ message: "Invalid request" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
