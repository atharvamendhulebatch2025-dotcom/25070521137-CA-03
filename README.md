# FLEXI — Student Management System

A simple full-stack college project using React, Vite, Node.js, Express, and MongoDB.

## Features
- Create, read, update, and delete student records (CRUD)
- Search students by name, email, course, or roll number
- Dashboard statistics
- Responsive, simple college-evaluation-friendly interface
- MongoDB persistence through Mongoose
- API and database error messages

## Requirements
- Node.js 18+ and npm
- MongoDB Community Server running locally, OR a MongoDB Atlas connection string
- MongoDB Compass (optional, to view/edit your database)

## 1. Configure MongoDB
### Local MongoDB
Install and start MongoDB Community Server. Open MongoDB Compass and connect to:
`mongodb://127.0.0.1:27017`

The app creates the `flexi_student_db` database and `students` collection automatically when the first student is saved.

### MongoDB Atlas
Create a database and obtain your connection string, then place it in `backend/.env` as `MONGO_URI`. Add your current IP address to the Atlas Network Access allowlist and create a database user.

## 2. Start the backend
Open a terminal in the project folder:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and check the MongoDB connection string:
- Windows PowerShell: `Copy-Item .env.example .env`
- macOS/Linux: `cp .env.example .env`

Then run:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

## 3. Start the frontend
Open a second terminal in the project folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## 4. Test CRUD
1. Add a student using **Add Student**.
2. Confirm the record appears in the table.
3. Use the edit icon/button to update a record.
4. Delete a record and confirm it disappears.
5. Refresh the browser; saved records remain because they are stored in MongoDB.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/health` | API health check |

Student fields: `fullName`, `rollNumber`, `email`, `course`, `year`, `status`.

## Project structure
```text
FLEXI-Student-Management/
├── backend/
│   ├── models/Student.js
│   ├── routes/studentRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── api.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Common issues
- **MongoDB connection refused:** make sure MongoDB Community Server is running, or verify your Atlas URI.
- **Port already in use:** change `PORT` in `backend/.env`; update `VITE_API_URL` in `frontend/.env` if needed.
- **Frontend cannot connect:** start the backend first and check `http://localhost:5000/api/health`.
- **Compass looks empty:** add a student through the app first; MongoDB creates the database/collection on first insert.

This is an educational starter project. Before production use, add authentication, role-based permissions, pagination, audit logging, and stronger deployment security.
