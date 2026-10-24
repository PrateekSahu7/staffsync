const mongoose = require('mongoose');

const DAY = 24 * 60 * 60 * 1000;

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// upcoming / ongoing / completed, worked out from the dates so it never goes stale
trainingSchema.virtual('status').get(function () {
  const now = Date.now();
  if (now < this.startDate.getTime()) return 'upcoming';
  if (now < this.endDate.getTime() + DAY) return 'ongoing';
  return 'completed';
});

module.exports = mongoose.model('Training', trainingSchema);
