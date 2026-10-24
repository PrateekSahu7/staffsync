const Announcement = require('../models/Announcement');

// GET /api/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const items = await Announcement.find().populate('postedBy', 'name').sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/announcements  (HR and managers)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, category, eventDate } = req.body;
    if (category === 'event' && !eventDate) {
      return res.status(400).json({ message: 'Choose a date for the event' });
    }
    const item = await Announcement.create({
      title,
      body,
      category,
      eventDate: category === 'event' ? eventDate : undefined,
      postedBy: req.employee._id,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/announcements/:id  (HR any post, managers only their own)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role === 'manager' && String(item.postedBy) !== String(req.employee._id)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    await item.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};
