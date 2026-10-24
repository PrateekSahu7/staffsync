const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', c.getDashboard);
router.get('/attendance', authorize('hr'), c.getAttendanceReport);
router.get('/leaves', authorize('hr'), c.getLeaveReport);
router.get('/employees', authorize('hr'), c.getEmployeeReport);

module.exports = router;
