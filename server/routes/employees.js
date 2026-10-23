const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const FIELDS = ['name', 'email', 'role', 'department', 'designation', 'phone', 'address'];

// HR sees everyone, managers see their own team
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'manager' ? { manager: req.user._id } : {};
    const users = await User.find(filter).select('-password').populate('manager', 'name').sort('name');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.manager) delete data.manager;
    const user = await User.create(data);
    const { password, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authorize('hr'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });
    user.manager = req.body.manager || undefined;
    if (req.body.password) user.password = req.body.password;

    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
