const mongoose = require('mongoose');

// Everyone in the company (employees, managers and HR) has one Employee record
// linked to their login account. Leaves, attendance, training and posts point here.
const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
