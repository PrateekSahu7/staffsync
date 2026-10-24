const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// POST /api/leaves  (employees and managers)
exports.applyLeave = async (req, res, next) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: 'From date, to date and reason are required' });
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return res.status(400).json({ message: 'End date cannot be before start date' });

    const overlap = await Leave.findOne({
      employee: req.employee._id,
      status: { $ne: 'rejected' },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    });
    if (overlap) {
      return res.status(400).json({ message: 'You already have a leave request covering some of these dates' });
    }

    const leave = await Leave.create({ employee: req.employee._id, type, fromDate: from, toDate: to, reason });
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves/mine
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employee: req.employee._id })
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves  (managers see their team, HR sees everyone)
exports.getLeaves = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') {
      const team = await Employee.find({ manager: req.employee._id }).select('_id');
      filter = { employee: { $in: team.map((e) => e._id) } };
    }
    const leaves = await Leave.find(filter)
      .populate('employee', 'name department')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// PUT /api/leaves/:id/status
exports.reviewLeave = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (String(leave.employee._id) === String(req.employee._id)) {
      return res.status(403).json({ message: 'You cannot review your own request' });
    }
    if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.employee._id)) {
      return res.status(403).json({ message: 'This employee is not on your team' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    leave.status = status;
    leave.reviewedBy = req.employee._id;
    leave.reviewComment = comment;
    await leave.save();
    res.json(leave);
  } catch (err) {
    next(err);
  }
};
