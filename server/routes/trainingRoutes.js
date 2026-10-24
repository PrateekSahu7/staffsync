const router = require('express').Router();
const c = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', c.getTraining);
router.post('/', authorize('manager'), c.createTraining);
router.put('/:id', authorize('manager'), c.updateTraining);
router.delete('/:id', authorize('manager'), c.deleteTraining);

module.exports = router;
