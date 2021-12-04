const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user_object = users.find((user) => user.username === username);

  if (!user_object) {
    return response.status(404).json({ error: "this username not exist" });
  }

  request.user_object = user_object;

  next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const username_already_exist = users.some(
    (user) => user.username === username
  );

  if (username_already_exist) {
    return response.status(400).json({ error: "username already exist" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user_object } = request;

  return response.status(201).json(user_object.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user_object } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user_object.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user_object } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo_upadate = user_object.todos.find((todo) => todo.id === id);

  if (!todo_upadate) {
    return response.status(404).json({ error: "this to-do not exist" });
  }

  todo_upadate.title = title;
  todo_upadate.deadline = new Date(deadline);

  return response.status(201).send(todo_upadate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user_object } = request;
  const id = request.params.id;

  const todo_done = user_object.todos.find((todo) => todo.id === id);
  if (!todo_done) {
    return response.status(404).json({ error: "to-do not exist" });
  }
  todo_done.done = true;

  return response.status(201).send(todo_done);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user_object } = request;
  const { id } = request.params;

  const todo_index = user_object.todos.findIndex((todo) => todo.id === id);

  if (todo_index === -1) {
    return response.status(404).json({ error: "to-do not exist" });
  }

  user_object.todos.splice(todo_index, 1);

  return response.status(204).send();
});

module.exports = app;
