const router = require('express').Router();
const c = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('employee', 'manager'), c.applyLeave);
router.get('/mine', c.getMyLeaves);
router.get('/', authorize('hr', 'manager'), c.getLeaves);
router.put('/:id/status', authorize('hr', 'manager'), c.reviewLeave);

module.exports = router;
