const Training = require('../models/Training');
const Employee = require('../models/Employee');

// Only people on the manager's own team can be enrolled
async function teamOnly(managerId, ids = []) {
  const team = await Employee.find({ _id: { $in: ids }, manager: managerId }).select('_id');
  return team.map((e) => e._id);
}

// GET /api/training  (employees: enrolled programs, managers: their own, HR: all)
exports.getTraining = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'employee') filter = { participants: req.employee._id };
    if (req.user.role === 'manager') filter = { createdBy: req.employee._id };
    const items = await Training.find(filter)
      .populate('participants', 'name')
      .populate('createdBy', 'name')
      .sort('startDate');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/training  (managers)
exports.createTraining = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, participants } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
    const item = await Training.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.employee._id,
      participants: await teamOnly(req.employee._id, participants),
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/training/:id  (the manager who created it)
exports.updateTraining = async (req, res, next) => {
  try {
    const item = await Training.findOne({ _id: req.params.id, createdBy: req.employee._id });
    if (!item) return res.status(404).json({ message: 'Training program not found' });
    const { title, description, startDate, endDate, participants } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
    Object.assign(item, { title, description, startDate, endDate });
    item.participants = await teamOnly(req.employee._id, participants);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/training/:id  (the manager who created it)
exports.deleteTraining = async (req, res, next) => {
  try {
    const item = await Training.findOneAndDelete({ _id: req.params.id, createdBy: req.employee._id });
    if (!item) return res.status(404).json({ message: 'Training program not found' });
    res.json({ message: 'Training program deleted' });
  } catch (err) {
    next(err);
  }
};
