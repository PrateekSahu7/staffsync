const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    category: { type: String, enum: ['announcement', 'news', 'event'], default: 'announcement' },
    eventDate: { type: Date }, // only for events
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
