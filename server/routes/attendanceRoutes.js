const router = require('express').Router();
const c = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', c.getToday);
router.post('/check-in', c.checkIn);
router.put('/check-out', c.checkOut);
router.get('/mine', c.getMyAttendance);
router.get('/', authorize('hr', 'manager'), c.getAttendance);

module.exports = router;
