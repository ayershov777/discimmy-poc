const router = require('express').Router();
const moduleController = require('../controllers/module.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Public routes - accessible without authentication
router.get('/', moduleController.getModulesByPathway);
router.get('/:id', moduleController.getModuleById);

// Protected routes - require authentication
router.post('/', authenticateUser, moduleController.createModule);
router.post('/batch', authenticateUser, moduleController.createModulesBatch);
router.put('/:id', authenticateUser, moduleController.updateModule);
router.delete('/:id', authenticateUser, moduleController.deleteModule);

module.exports = router;
