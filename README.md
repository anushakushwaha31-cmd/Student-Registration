# Student Registration System — Full Stack + API Fetching

A beginner-friendly full-stack student registration project using HTML, CSS, JavaScript, Node.js, Express, SQLite, and the JavaScript Fetch API.

## Features

- Responsive student registration form
- `fetch()` POST request to register a student
- `fetch()` GET request to load student records from the API
- `fetch()` DELETE request to remove a student
- Refresh button to fetch the latest records
- SQLite persistence
- Validation for required fields and email format
- Duplicate email and roll number handling
- REST API returns JSON responses

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js and Express.js
- Database: SQLite via better-sqlite3
- API: REST endpoints and browser Fetch API

## Run locally

Install a current Node.js LTS version, then open a terminal in this project folder and run:

```bash
npm install
npm start
```

Open http://localhost:3000. Keep the terminal running while using the app.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | Fetch all registered students |
| GET | `/api/students/:id` | Fetch one student by ID |
| POST | `/api/students` | Create a registration |
| DELETE | `/api/students/:id` | Delete a registration |

Example POST body:

```json
{
  "fullName": "Ananya Sharma",
  "email": "ananya@example.com",
  "rollNumber": "CS2026001",
  "course": "Computer Science",
  "gender": "Prefer not to say"
}
```

## Project structure

```text
student-registration-api/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Push to GitHub

Create an empty GitHub repository, then run these commands from the project folder:

```bash
git init
git add .
git commit -m "Build student registration app with REST API fetching"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Student-Registration-System.git
git push -u origin main
```

Replace `YOUR-USERNAME` and the repository URL with your own values.

## Important notes

- `fetch("/api/students")` calls this project's own backend API. It is not a third-party API.
- The SQLite database is created locally and is intentionally excluded from Git.
- This is a learning project, not production-ready for real student records. Before deployment, add authentication and authorization, rate limiting, HTTPS, privacy protections, and access controls for the list/delete endpoints.
