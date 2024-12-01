const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Ayaz2502",
  port: 5432,
});

// Middleware to parse JSON request
app.use(express.json());

// Placeholder data instead of a database (for now)

// Stub function to create tasks table
async function createTable() {
  try {
    console.log("Creating tasks table...");
    await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY key,
                description TEXT NOT NULL,
                status TEXT NOT NULL);
                `);
  } catch (error) {
    console.error("Error creating tasks table:", error);
  }
}
let tasks = [
  { id: 1, description: "Buy groceries", status: "incomplete" },
  { id: 2, description: "Read a book", status: "complete" },
];

// GET /tasks - Get all tasks
app.get("/tasks", async (request, response) => {
  const result = await pool.query("SELECT * FROM tasks");
  response.json(result.rows);
});

// POST /tasks - Add a new task
app.post("/tasks", async (request, response) => {
  const { description, status } = request.body;
  if (!description || !status) {
    return response.status(400).json({
      error: "All fields (id, description, status) are required",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (description, status) VALUES ($1, $2);",
      [description, status]
    );
    response
      .status(201)
      .json({ message: "Task added successfully", task: result.rows[0] });
  } catch (error) {
    console.error("Error adding task:", error);
    response.status(500).json({ error: "Failed to add task" });
  }
});

// PUT /tasks/:id - Update a task's status
app.put("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const { status } = request.body;

  if (!status) {
    return response.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Task not found" });
    }

    response.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    response.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [taskId]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Task not found" });
    }

    response.json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    response.status(500).json({ error: "Failed to delete task" });
  }
});

createTable().then(() =>
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  )
);
