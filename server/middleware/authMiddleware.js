const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Verifies the JWT. Sets req.user (login account) and req.employee (person record).
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Not authorised, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    const employee = await Employee.findOne({ user: user._id });
    if (!employee) return res.status(401).json({ message: 'Employee record not found' });

    req.user = user;
    req.employee = employee;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorised, token invalid or expired' });
  }
};

// Restricts a route to the given roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};
