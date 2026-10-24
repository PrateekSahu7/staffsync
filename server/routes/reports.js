const router = require('express').Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const DAY = 24 * 60 * 60 * 1000;
const isoDay = (d = new Date()) => d.toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / DAY) + 1;
const countStatus = (list, s) => list.filter((t) => t.status === s).length;

// Reads ?from=&to= (YYYY-MM-DD); defaults to the current month so far
function getRange(q) {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  const to = q.to || isoDay();
  const from = q.from || to.slice(0, 8) + '01';
  if (!re.test(from) || !re.test(to)) return null;
  return { from, to };
}

// Role-specific dashboard numbers
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = isoDay();
    const dayStart = new Date(today + 'T00:00:00.000Z');
    const dayEnd = new Date(today + 'T23:59:59.999Z');
    const role = req.user.role;

    if (role === 'hr') {
      const [employees, pendingLeaves, presentToday, onLeaveToday, trainings] = await Promise.all([
        User.countDocuments(),
        Leave.countDocuments({ status: 'pending' }),
        Attendance.countDocuments({ date: today }),
        Leave.countDocuments({ status: 'approved', fromDate: { $lte: dayEnd }, toDate: { $gte: dayStart } }),
        Training.find(),
      ]);
      const activeTrainings = countStatus(trainings, 'upcoming') + countStatus(trainings, 'ongoing');
      return res.json({ role, stats: { employees, pendingLeaves, presentToday, onLeaveToday, activeTrainings } });
    }

    if (role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      const ids = team.map((u) => u._id);
      const [pendingLeaves, presentToday, trainings] = await Promise.all([
        Leave.countDocuments({ employee: { $in: ids }, status: 'pending' }),
        Attendance.countDocuments({ user: { $in: ids }, date: today }),
        Training.find({ createdBy: req.user._id }),
      ]);
      return res.json({
        role,
        stats: {
          teamSize: ids.length,
          pendingLeaves,
          presentToday,
          upcomingTrainings: countStatus(trainings, 'upcoming'),
          ongoingTrainings: countStatus(trainings, 'ongoing'),
        },
      });
    }

    // employee
    const yearStart = new Date(`${new Date().getUTCFullYear()}-01-01T00:00:00.000Z`);
    const [leaves, todayRecord, trainings] = await Promise.all([
      Leave.find({ employee: req.user._id }),
      Attendance.findOne({ user: req.user._id, date: today }),
      Training.find({ participants: req.user._id }),
    ]);
    const daysTaken = leaves
      .filter((l) => l.status === 'approved' && l.fromDate >= yearStart)
      .reduce((sum, l) => sum + daysBetween(l.fromDate, l.toDate), 0);
    res.json({
      role,
      stats: {
        attendanceToday: todayRecord ? (todayRecord.checkOut ? 'Checked out' : 'Checked in') : 'Not checked in',
        daysTaken,
        pendingLeaves: leaves.filter((l) => l.status === 'pending').length,
        activeTrainings: countStatus(trainings, 'upcoming') + countStatus(trainings, 'ongoing'),
      },
    });
  } catch (err) {
    next(err);
  }
});

// HR report: days present and hours worked per person in a date range
router.get('/attendance', authorize('hr'), async (req, res, next) => {
  try {
    const range = getRange(req.query);
    if (!range) return res.status(400).json({ message: 'Dates must look like YYYY-MM-DD' });

    const [users, records] = await Promise.all([
      User.find().select('name department'),
      Attendance.find({ date: { $gte: range.from, $lte: range.to } }),
    ]);

    const map = new Map(users.map((u) => [String(u._id), { name: u.name, department: u.department || '-', daysPresent: 0, hours: 0 }]));
    records.forEach((r) => {
      const row = map.get(String(r.user));
      if (!row) return;
      row.daysPresent += 1;
      if (r.checkOut) row.hours += (r.checkOut - r.checkIn) / 3600000;
    });

    const rows = [...map.values()]
      .map((r) => ({ ...r, hours: Math.round(r.hours * 10) / 10 }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ ...range, rows });
  } catch (err) {
    next(err);
  }
});

// HR report: leave requests that overlap a date range
router.get('/leaves', authorize('hr'), async (req, res, next) => {
  try {
    const range = getRange(req.query);
    if (!range) return res.status(400).json({ message: 'Dates must look like YYYY-MM-DD' });

    const leaves = await Leave.find({
      fromDate: { $lte: new Date(range.to + 'T23:59:59.999Z') },
      toDate: { $gte: new Date(range.from + 'T00:00:00.000Z') },
    })
      .populate('employee', 'name department')
      .sort('fromDate');

    const rows = leaves.map((l) => ({
      employee: l.employee?.name || 'Deleted user',
      department: l.employee?.department || '-',
      type: l.type,
      fromDate: l.fromDate,
      toDate: l.toDate,
      days: daysBetween(l.fromDate, l.toDate),
      status: l.status,
      reason: l.reason,
    }));
    const summary = {
      pending: rows.filter((r) => r.status === 'pending').length,
      approved: rows.filter((r) => r.status === 'approved').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
    };
    res.json({ ...range, summary, rows });
  } catch (err) {
    next(err);
  }
});

// HR report: headcount by department and role
router.get('/employees', authorize('hr'), async (req, res, next) => {
  try {
    const users = await User.find().select('department role');
    const map = new Map();
    users.forEach((u) => {
      const key = u.department || 'No department';
      const row = map.get(key) || { department: key, total: 0, hr: 0, manager: 0, employee: 0 };
      row.total += 1;
      row[u.role] += 1;
      map.set(key, row);
    });
    const rows = [...map.values()].sort((a, b) => a.department.localeCompare(b.department));
    res.json({ total: users.length, rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
