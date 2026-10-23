# StaffSync

A web-based HR management system built on the MERN stack (MongoDB, Express, React, Node). It has three roles with separate access:

| Role | What they can do |
|------|------------------|
| HR | Add, edit and delete employees; approve or reject any leave; view all attendance; post announcements and company news |
| Manager | Review leave requests from their team; view team attendance; create training programs and enrol team members; apply for leave (goes to HR) |
| Employee | Apply for leave and track its status; check in and out; edit personal details; read announcements; see assigned training |

## Tech stack

React 18 (Vite), React Router, Axios, Bootstrap 5, Node.js, Express, MongoDB with Mongoose, JWT authentication, bcrypt password hashing.

## Run it locally

You need Node.js 16+ and MongoDB running locally (or a MongoDB Atlas connection string).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # then edit JWT_SECRET (and MONGO_URI if needed)
npm run seed                # creates demo accounts
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev                 # app on http://localhost:5173
```

## Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| HR | hr@staffsync.com | hr12345 |
| Manager | manager@staffsync.com | manager123 |
| Employee | employee@staffsync.com | employee123 |

Change or delete these before any real deployment.

## Project structure

```
server/
  server.js            app entry, routes, error handler
  seed.js              demo data
  config/db.js         MongoDB connection
  middleware/auth.js   JWT check (protect) and role check (authorize)
  models/              User, Leave, Attendance, Announcement, Training
  routes/              auth, employees, leaves, attendance, announcements, training
client/
  src/App.jsx          routes
  src/AuthContext.jsx  login state and token handling
  src/api.js           Axios instance that attaches the JWT
  src/pages/           Login, Dashboard, Employees, Leaves, Attendance, Announcements, Training
```

## API summary

All routes except login need `Authorization: Bearer <token>`.

| Method and path | Who | Purpose |
|-----------------|-----|---------|
| POST /api/auth/login | anyone | Log in, returns token |
| GET, PUT /api/auth/me | any | View or update own profile |
| GET /api/employees | HR, manager | List people (managers see their team) |
| POST, PUT, DELETE /api/employees | HR | Manage employees |
| POST /api/leaves | employee, manager | Apply for leave |
| GET /api/leaves/mine | any | Own leave history |
| GET /api/leaves | HR, manager | Requests to review |
| PUT /api/leaves/:id/status | HR, manager | Approve or reject |
| POST /api/attendance/check-in, PUT /api/attendance/check-out | any | Mark attendance |
| GET /api/attendance/mine, GET /api/attendance | any, HR and manager | History and team view |
| GET, POST, DELETE /api/announcements | read: any, write: HR | Announcements and news |
| GET, POST, PUT, DELETE /api/training | read: any, write: manager | Training programs |

## Deploying

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Deploy `server/` to Render or Railway. Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` (your frontend URL). Start command: `npm start`.
3. Deploy `client/` to Vercel or Netlify. Set `VITE_API_URL` to `https://<your-backend>/api`. Build command: `npm run build`, output directory: `dist`.
4. Run `npm run seed` once against the Atlas database (set `MONGO_URI` locally to the Atlas string) to create the demo users.

## Links

- Live demo: _add your link here_
- GitHub: _add your link here_
