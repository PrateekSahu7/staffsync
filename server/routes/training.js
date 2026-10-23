const router = require('express').Router();
const Training = require('../models/Training');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Employees see programs they are enrolled in, managers see their own, HR sees all
router.get('/', async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'employee') filter = { participants: req.user._id };
    if (req.user.role === 'manager') filter = { createdBy: req.user._id };
    const items = await Training.find(filter)
      .populate('participants', 'name')
      .populate('createdBy', 'name')
      .sort('startDate');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Only people on the manager's own team can be enrolled
async function teamOnly(managerId, ids = []) {
  const team = await User.find({ _id: { $in: ids }, manager: managerId }).select('_id');
  return team.map((u) => u._id);
}

router.post('/', authorize('manager'), async (req, res, next) => {
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
      createdBy: req.user._id,
      participants: await teamOnly(req.user._id, participants),
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authorize('manager'), async (req, res, next) => {
  try {
    const item = await Training.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!item) return res.status(404).json({ message: 'Training program not found' });
    const { title, description, startDate, endDate, participants } = req.body;
    Object.assign(item, { title, description, startDate, endDate });
    item.participants = await teamOnly(req.user._id, participants);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('manager'), async (req, res, next) => {
  try {
    const item = await Training.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!item) return res.status(404).json({ message: 'Training program not found' });
    res.json({ message: 'Training program deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
