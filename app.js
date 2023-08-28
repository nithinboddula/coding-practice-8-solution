const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const requestOfStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const requestOfPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const requestOfPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

// API 1

app.get("/todos/", async (request, response) => {
  const { priority, status, search_q = "" } = request.query;
  let getTodoQuery = "";

  switch (true) {
    case requestOfPriorityAndStatus(request.query):
      getTodoQuery = `SELECT *
        FROM 
            todo
        WHERE
            priority = '${priority}' AND status = '${status}' ; `;
      break;
    case requestOfStatus(request.query):
      getTodoQuery = `SELECT *
        FROM 
            todo
        WHERE
            status = '${status}' ; `;
      break;
    case requestOfPriority(request.query):
      getTodoQuery = `SELECT *
        FROM 
            todo
        WHERE
            priority = '${priority}' ; `;
      break;
    default:
      getTodoQuery = `SELECT *
        FROM 
            todo
        WHERE
            todo LIKE '%${search_q}%' ; `;
      break;
  }

  const data = await db.all(getTodoQuery);
  response.send(data);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoArrayQuery = `SELECT *
    FROM 
        todo
    WHERE 
        id = ${todoId}; `;

  const todoDetails = await db.get(getTodoArrayQuery);
  response.send(todoDetails);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
    INSERT INTO 
        todo(id, todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//
const updateStatus = (status) => {
  return status !== undefined;
};

const updatePriority = (priority) => {
  return priority !== undefined;
};

const updateTodo = (todo) => {
  return todo !== undefined;
};

// API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { status, priority, todo } = request.body;
  const { todoId } = request.params;
  let updateQuery = "";
  let message = "";
  switch (true) {
    case updateStatus(status):
      updateQuery = `
            UPDATE
                todo
            SET 
                status = '${status}';`;
      message = "Status Updated";
      break;
    case updatePriority(priority):
      updateQuery = `
            UPDATE
                todo
            SET 
                priority = '${priority}';`;
      message = "Priority Updated";
      break;
    case updateTodo(todo):
      updateQuery = `
            UPDATE
                todo
            SET 
                todo = '${todo}';`;
      message = "Todo Updated";
      break;
  }

  await db.run(updateQuery);
  response.send(message);
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId} ;`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
