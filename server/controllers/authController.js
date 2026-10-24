const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { toProfile, createAccount } = require('./employeeController');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Simple in-memory brute-force guard: 10 failed logins per email and IP per 15 minutes
const WINDOW = 15 * 60 * 1000;
const MAX_FAILS = 10;
const attempts = new Map();
const isLocked = (key) => {
  const a = attempts.get(key);
  return !!a && Date.now() - a.first <= WINDOW && a.count >= MAX_FAILS;
};
const recordFail = (key) => {
  const a = attempts.get(key);
  if (!a || Date.now() - a.first > WINDOW) attempts.set(key, { count: 1, first: Date.now() });
  else a.count += 1;
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const key = `${req.ip}:${String(email).toLowerCase()}`;
    if (isLocked(key)) {
      return res.status(429).json({ message: 'Too many failed attempts. Try again in 15 minutes.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      recordFail(key);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    const employee = await Employee.findOne({ user: user._id }).populate('manager', 'name');
    if (!employee) return res.status(401).json({ message: 'Employee record not found' });

    attempts.delete(key);
    res.json({ token: sign(user._id), user: toProfile(user, employee) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register  (HR only: creates a login account and employee record)
exports.register = async (req, res, next) => {
  try {
    const { user, employee } = await createAccount(req.body);
    res.status(201).json(toProfile(user, employee));
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const employee = await req.employee.populate('manager', 'name');
    res.json(toProfile(req.user, employee));
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/me  - people maintain their own personal record
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const employee = req.employee;
    if (name) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    await employee.save();
    res.json(toProfile(req.user, employee));
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) {
    next(err);
  }
};
