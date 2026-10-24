const router = require('express').Router();
const c = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('hr', 'manager'), c.getEmployees);
router.post('/', authorize('hr'), c.addEmployee);
router.put('/:id', authorize('hr'), c.updateEmployee);
router.delete('/:id', authorize('hr'), c.deleteEmployee);

module.exports = router;
