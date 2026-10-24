const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const items = await Announcement.find().populate('postedBy', 'name').sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// HR and managers can publish
router.post('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const { title, body, category } = req.body;
    const item = await Announcement.create({ title, body, category, postedBy: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// HR can delete any post; managers only their own
router.delete('/:id', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role === 'manager' && String(item.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    await item.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
