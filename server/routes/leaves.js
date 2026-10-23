const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Apply for leave (employees and managers)
router.post('/', authorize('employee', 'manager'), async (req, res, next) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: 'From date, to date and reason are required' });
    }
    if (new Date(toDate) < new Date(fromDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
    const leave = await Leave.create({ employee: req.user._id, type, fromDate, toDate, reason });
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
});

// My own leave history
router.get('/mine', async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (err) {
    next(err);
  }
});

// Requests to review: managers see their team, HR sees everyone
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter = { employee: { $in: team.map((u) => u._id) } };
    }
    const leaves = await Leave.find(filter)
      .populate('employee', 'name department role')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (err) {
    next(err);
  }
});

// Approve or reject
router.put('/:id/status', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id)) {
      return res.status(403).json({ message: 'This employee is not on your team' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = comment;
    await leave.save();
    res.json(leave);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
