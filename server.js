const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3001;
const db = new Database("students.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    roll_number TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    gender TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function mapStudent(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    rollNumber: row.roll_number,
    course: row.course,
    gender: row.gender,
    createdAt: row.created_at
  };
}

// GET: Fetch all registered students from the database.
app.get("/api/students", (req, res) => {
  const rows = db.prepare(`
    SELECT id, full_name, email, roll_number, course, gender, created_at
    FROM students
    ORDER BY id DESC
  `).all();

  res.json({ count: rows.length, students: rows.map(mapStudent) });
});

// GET: Fetch one student by ID.
app.get("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Student ID must be a positive number." });
  }

  const row = db.prepare(`
    SELECT id, full_name, email, roll_number, course, gender, created_at
    FROM students WHERE id = ?
  `).get(id);

  if (!row) return res.status(404).json({ message: "Student not found." });
  res.json({ student: mapStudent(row) });
});

// POST: Validate and save a new student.
app.post("/api/students", (req, res) => {
  const { fullName, email, rollNumber, course, gender } = req.body || {};
  const fields = [fullName, email, rollNumber, course, gender];

  if (!fields.every(value => typeof value === "string" && value.trim())) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  const student = {
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    roll_number: rollNumber.trim(),
    course: course.trim(),
    gender: gender.trim()
  };

  if (student.full_name.length > 100 ||
      student.email.length > 150 ||
      student.roll_number.length > 30 ||
      student.course.length > 100 ||
      student.gender.length > 30) {
    return res.status(400).json({ message: "One or more fields are too long." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    const result = db.prepare(`
      INSERT INTO students (full_name, email, roll_number, course, gender)
      VALUES (@full_name, @email, @roll_number, @course, @gender)
    `).run(student);

    const saved = db.prepare(`
      SELECT id, full_name, email, roll_number, course, gender, created_at
      FROM students WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: "Registration successful!",
      student: mapStudent(saved)
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "That email address or roll number is already registered."
      });
    }
    console.error(error);
    res.status(500).json({ message: "Server error while saving registration." });
  }
});

// DELETE: Delete a student by ID (useful for learning REST APIs).
app.delete("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "Student ID must be a positive number." });
  }

  const result = db.prepare("DELETE FROM students WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ message: "Student not found." });
  }
  res.json({ message: "Student deleted successfully." });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
