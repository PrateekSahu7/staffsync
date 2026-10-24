// Creates demo accounts: npm run seed. This DELETES all existing people and announcements.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');
const Training = require('./models/Training');
const Announcement = require('./models/Announcement');

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed while NODE_ENV is production: this wipes all data.');
  process.exit(1);
}

async function person({ name, email, password, role, department, designation, manager }) {
  const user = await User.create({ email, password, role });
  return Employee.create({ user: user._id, name, department, designation, manager });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany({}), Employee.deleteMany({}), Leave.deleteMany({}),
    Attendance.deleteMany({}), Training.deleteMany({}), Announcement.deleteMany({}),
  ]);

  const hr = await person({
    name: 'Hana Rao', email: 'hr@staffsync.com', password: 'hr12345', role: 'hr',
    department: 'People Operations', designation: 'HR Lead',
  });
  const manager = await person({
    name: 'Mohan Das', email: 'manager@staffsync.com', password: 'manager123', role: 'manager',
    department: 'Engineering', designation: 'Engineering Manager',
  });
  await person({
    name: 'Esha Nair', email: 'employee@staffsync.com', password: 'employee123', role: 'employee',
    department: 'Engineering', designation: 'Software Engineer', manager: manager._id,
  });
  await person({
    name: 'Ravi Kumar', email: 'ravi@staffsync.com', password: 'employee123', role: 'employee',
    department: 'Engineering', designation: 'QA Engineer', manager: manager._id,
  });

  await Announcement.create({
    title: 'Welcome to StaffSync', category: 'announcement', postedBy: hr._id,
    body: 'Mark your attendance daily and apply for leave from the Leaves page.',
  });

  console.log('Seeded. Demo logins:');
  console.log('  HR:       hr@staffsync.com / hr12345');
  console.log('  Manager:  manager@staffsync.com / manager123');
  console.log('  Employee: employee@staffsync.com / employee123');
  await mongoose.disconnect();
})();
