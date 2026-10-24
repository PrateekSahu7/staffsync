# StaffSync

A web-based HR management system built on the MERN stack (MongoDB, Express, React, Node). It has three roles with separate access:

| Role | What they can do |
|------|------------------|
| HR | Add, edit and delete employees; approve or reject any leave; view all attendance; post and delete announcements; run reports (attendance, leaves, headcount) with CSV export |
| Manager | Review leave requests from their team; view team attendance; create training programs, enrol team members and track their status; post announcements (and delete their own); apply for leave (goes to HR) |
| Employee | Apply for leave and track its status; check in and out; edit personal details and change password; read announcements; see assigned training |

Each role gets its own dashboard numbers (HR: headcount, pending leaves, who is in today; managers: team size, team leaves, trainings; employees: today's attendance, leave days taken, trainings). Pages refresh themselves every 30 seconds. Announcements can be marked as announcement, company news, or an event with a date.

## Tech stack

React 18 (Vite), React Router, Axios, Bootstrap 5, Node.js, Express, MongoDB with Mongoose, JWT authentication, bcrypt password hashing.

## Architecture (MVC)

The backend follows Model-View-Controller, where the View layer is the routing layer of the REST API.

```
Browser (React) -> routes -> authMiddleware (JWT + role check) -> controller -> model -> MongoDB
                                                                        |
Browser (React) <---------------------- JSON response <-----------------+
```

## Backend structure

```
server/
  server.js                 starts Express, connects to MongoDB, loads routes and middleware
  seed.js                   demo data (wipes existing data, refuses to run in production)
  config/
    db.js                   MongoDB connection (Mongoose)
    time.js                 company time zone helper for attendance dates
  controllers/
    announcementController.js   announcements, news and events
    attendanceController.js     check in and out, history, team view
    authController.js           login, register (HR only), profile, change password
    employeeController.js       add, edit, delete, view employees
    leaveController.js          apply, list, approve or reject
    trainingController.js       create, assign, update training programs
    reportController.js         dashboard numbers and HR reports
  middleware/
    authMiddleware.js       checks the JWT and the user's role
  models/
    User.js                 login account: email, password hash, role
    Employee.js             person record: name, department, designation, contact, manager
    Leave.js  Attendance.js  Announcement.js  Training.js
  routes/
    authRoutes.js  employeeRoutes.js  leaveRoutes.js  attendanceRoutes.js
    announcementRoutes.js  trainingRoutes.js  reportRoutes.js
```

Every person (employee, manager or HR) has one `User` (login) and one `Employee` (details). Leaves, attendance, training and posts point at the `Employee` record.

## Frontend structure

```
client/src/
  index.js                  entry point, renders <App /> into the page
  App.jsx                   routes and overall layout
  App.css                   global styling
  AuthContext.jsx  api.js  usePolling.js
  components/
    Navbar.jsx  ProtectedRoute.jsx
    DashboardView.jsx  UpcomingTrainings.jsx  LeaveReviewTable.jsx   shared building blocks
    auth/
      Login.jsx                 login form
      Register.jsx              HR registers a new employee, manager or HR
    employee/
      Announcements.jsx         read announcements, news and events
      Attendance.jsx            check in and out, my history
      LeaveApply.jsx            apply for leave
      LeaveList.jsx             my leave history and status
    hr/
      AnnouncementsManager.jsx  post and manage announcements (managers use it too)
      AttendanceSummary.jsx     attendance overview (HR: everyone, manager: team)
      EmployeeCRUD.jsx          add, view, edit, delete employees (managers see their team read-only)
      LeaveApplications.jsx     HR approves or rejects leave
      Reports.jsx               attendance, leave and headcount reports with CSV export
    manager/
      LeaveApplications.jsx     manager approves or rejects team leave
      TrainingManagement.jsx    plan and assign training (employees and HR see it read-only)
  pages/
    EmployeeDashboard.jsx  HrDashboard.jsx  ManagerDashboard.jsx
```

## Run it locally

You need Node.js 16+ and MongoDB running locally (or a MongoDB Atlas connection string).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # then edit JWT_SECRET, MONGO_URI and COMPANY_TIMEZONE
npm run seed                # creates demo accounts
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev                 # app on http://localhost:5173
```

`COMPANY_TIMEZONE` decides which calendar day a check-in belongs to (for example `Asia/Kolkata`). It defaults to UTC.

## Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| HR | hr@staffsync.com | hr12345 |
| Manager | manager@staffsync.com | manager123 |
| Employee | employee@staffsync.com | employee123 |

Change or delete these before any real deployment.

## API summary

All routes except login need `Authorization: Bearer <token>`.

| Method and path | Who | Purpose |
|-----------------|-----|---------|
| POST /api/auth/login | anyone | Log in, returns token (10 failed tries per 15 minutes are blocked) |
| POST /api/auth/register | HR | Create a login account and employee record |
| GET, PUT /api/auth/me | any | View or update own profile |
| PUT /api/auth/password | any | Change own password |
| GET /api/employees | HR, manager | List people (managers see their team) |
| POST, PUT, DELETE /api/employees | HR | Manage employees (deleting removes their leaves, attendance and posts) |
| POST /api/leaves | employee, manager | Apply for leave (overlapping requests are refused) |
| GET /api/leaves/mine | any | Own leave history |
| GET /api/leaves | HR, manager | Requests to review |
| PUT /api/leaves/:id/status | HR, manager | Approve or reject |
| GET /api/attendance/today | any | Today's date (company time zone) and my record |
| POST /api/attendance/check-in, PUT /api/attendance/check-out | any | Mark attendance |
| GET /api/attendance/mine, GET /api/attendance | any, HR and manager | History and team view |
| GET, POST, DELETE /api/announcements | read: any, write: HR and manager (managers delete only their own) | Announcements, news, events |
| GET, POST, PUT, DELETE /api/training | read: any, write: manager | Training programs (status is upcoming, ongoing or completed) |
| GET /api/reports/dashboard | any | Role-specific dashboard numbers |
| GET /api/reports/attendance, /leaves (`?from=&to=`), /employees | HR | Report data for the Reports page |

## Deploying

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Deploy `server/` to Render or Railway. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL) and `COMPANY_TIMEZONE`. Start command: `npm start`.
3. Deploy `client/` to Vercel or Netlify. Set `VITE_API_URL` to `https://<your-backend>/api`. Build command: `npm run build`, output directory: `dist`.
4. Run `npm run seed` once against the Atlas database (set `MONGO_URI` locally to the Atlas string) to create the demo users. The seed script refuses to run if `NODE_ENV` is `production`.

## Links

- Live demo: _add your link here_
- GitHub: _add your link here_
