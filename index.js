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
app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

// POST /tasks - Add a new task
app.post("/tasks", (request, response) => {
  const { id, description, status } = request.body;
  if (!id || !description || !status) {
    return response.status(400).json({
      error: "All fields (id, description, status) are required",
    });
  }

  tasks.push({ id, description, status });
  response.status(201).json({ message: "Task added successfully" });
});

// PUT /tasks/:id - Update a task's status
app.put("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const { status } = request.body;
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return response.status(404).json({ error: "Task not found" });
  }
  task.status = status;
  response.json({ message: "Task updated successfully" });
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const initialLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== taskId);

  if (tasks.length === initialLength) {
    return response.status(404).json({ error: "Task not found" });
  }
  response.json({ message: "Task deleted successfully" });
});

createTable().then(() =>
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  )
);
