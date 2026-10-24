const User = require('../models/User');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Joins a login account and its employee record into the one object the frontend uses
const toProfile = (user, employee) => ({
  _id: employee._id,
  userId: user._id,
  name: employee.name,
  email: user.email,
  role: user.role,
  department: employee.department,
  designation: employee.designation,
  phone: employee.phone,
  address: employee.address,
  manager: employee.manager,
  joinDate: employee.joinDate,
});

// Creates a login account plus its employee record (used by register and add employee)
async function createAccount(data) {
  const { name, email, password, role, department, designation, phone, address, manager } = data;
  if (!name) throw httpError(400, 'Name is required');

  const user = await User.create({ email, password, role });
  try {
    const employee = await Employee.create({
      user: user._id,
      name,
      department,
      designation,
      phone,
      address,
      manager: manager || undefined,
    });
    return { user, employee };
  } catch (err) {
    await User.findByIdAndDelete(user._id); // do not leave an account without a record
    throw err;
  }
}

exports.toProfile = toProfile;
exports.createAccount = createAccount;

// HR sees everyone, managers see their own team
exports.getEmployees = async (req, res, next) => {
  try {
    const filter = req.user.role === 'manager' ? { manager: req.employee._id } : {};
    const employees = await Employee.find(filter)
      .populate('user', 'email role')
      .populate('manager', 'name')
      .sort('name');
    res.json(employees.filter((e) => e.user).map((e) => toProfile(e.user, e)));
  } catch (err) {
    next(err);
  }
};

exports.addEmployee = async (req, res, next) => {
  try {
    const { user, employee } = await createAccount(req.body);
    res.status(201).json(toProfile(user, employee));
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const user = await User.findById(employee.user);
    const b = req.body;

    if (b.role && b.role !== user.role && String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    if (b.manager && String(b.manager) === String(employee._id)) {
      return res.status(400).json({ message: 'A person cannot be their own manager' });
    }

    ['name', 'department', 'designation', 'phone', 'address'].forEach((f) => {
      if (b[f] !== undefined) employee[f] = b[f];
    });
    employee.manager = b.manager || undefined;
    if (b.email !== undefined) user.email = b.email;
    if (b.role !== undefined) user.role = b.role;
    if (b.password) user.password = b.password;

    await user.save();
    await employee.save();
    res.json(toProfile(user, employee));
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (String(req.employee._id) === String(id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Remove everything that belonged to this person so nothing is left pointing at them
    await Promise.all([
      User.findByIdAndDelete(employee.user),
      Leave.deleteMany({ employee: id }),
      Attendance.deleteMany({ employee: id }),
      Training.deleteMany({ createdBy: id }),
      Training.updateMany({}, { $pull: { participants: employee._id } }),
      Announcement.deleteMany({ postedBy: id }),
      Employee.updateMany({ manager: id }, { $unset: { manager: 1 } }),
    ]);
    await employee.deleteOne();
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
};
