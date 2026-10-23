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

router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const { title, body, category } = req.body;
    const item = await Announcement.create({ title, body, category, postedBy: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
