const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { today } = require('../config/time');

// GET /api/attendance/today  - today's date (company time zone) and my record, if any
exports.getToday = async (req, res, next) => {
  try {
    const date = today();
    const record = await Attendance.findOne({ employee: req.employee._id, date });
    res.json({ date, record });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance/check-in
exports.checkIn = async (req, res, next) => {
  try {
    const date = today();
    const existing = await Attendance.findOne({ employee: req.employee._id, date });
    if (existing) return res.status(400).json({ message: 'You have already checked in today' });
    const record = await Attendance.create({ employee: req.employee._id, date, checkIn: new Date() });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// PUT /api/attendance/check-out
exports.checkOut = async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ employee: req.employee._id, date: today() });
    if (!record) return res.status(400).json({ message: 'Check in first' });
    if (record.checkOut) return res.status(400).json({ message: 'You have already checked out today' });
    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/mine
exports.getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ employee: req.employee._id }).sort('-date').limit(60);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance?date=YYYY-MM-DD  (HR: everyone, manager: own team)
exports.getAttendance = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.user.role === 'manager') {
      const team = await Employee.find({ manager: req.employee._id }).select('_id');
      filter.employee = { $in: team.map((e) => e._id) };
    }
    const records = await Attendance.find(filter)
      .populate('employee', 'name department')
      .sort('-date')
      .limit(200);
    res.json(records);
  } catch (err) {
    next(err);
  }
};
