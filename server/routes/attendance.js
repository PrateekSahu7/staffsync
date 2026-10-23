const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const today = () => new Date().toISOString().slice(0, 10);

// Check in for today
router.post('/check-in', async (req, res, next) => {
  try {
    const existing = await Attendance.findOne({ user: req.user._id, date: today() });
    if (existing) return res.status(400).json({ message: 'You have already checked in today' });
    const record = await Attendance.create({ user: req.user._id, date: today(), checkIn: new Date() });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// Check out for today
router.put('/check-out', async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ user: req.user._id, date: today() });
    if (!record) return res.status(400).json({ message: 'Check in first' });
    if (record.checkOut) return res.status(400).json({ message: 'You have already checked out today' });
    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// My attendance history
router.get('/mine', async (req, res, next) => {
  try {
    const records = await Attendance.find({ user: req.user._id }).sort('-date').limit(60);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// Everyone's attendance (HR) or team attendance (manager); optional ?date=YYYY-MM-DD
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter.user = { $in: team.map((u) => u._id) };
    }
    const records = await Attendance.find(filter)
      .populate('user', 'name department')
      .sort('-date')
      .limit(200);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
