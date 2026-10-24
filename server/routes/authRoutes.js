const router = require('express').Router();
const c = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', c.login);
router.post('/register', protect, authorize('hr'), c.register);
router.get('/me', protect, c.me);
router.put('/me', protect, c.updateMe);
router.put('/password', protect, c.changePassword);

module.exports = router;
