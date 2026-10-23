// Creates demo accounts: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Announcement.deleteMany({})]);

  const hr = await User.create({
    name: 'Hana Rao', email: 'hr@staffsync.com', password: 'hr12345', role: 'hr',
    department: 'People Operations', designation: 'HR Lead',
  });
  const manager = await User.create({
    name: 'Mohan Das', email: 'manager@staffsync.com', password: 'manager123', role: 'manager',
    department: 'Engineering', designation: 'Engineering Manager',
  });
  await User.create({
    name: 'Esha Nair', email: 'employee@staffsync.com', password: 'employee123', role: 'employee',
    department: 'Engineering', designation: 'Software Engineer', manager: manager._id,
  });
  await User.create({
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
