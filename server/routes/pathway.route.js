const router = require('express').Router();
const pathwayController = require('../controllers/pathway.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Public routes - accessible without authentication
router.get('/', pathwayController.getAllPathways);
router.get('/:id', pathwayController.getPathwayById);

// Protected routes - require authentication
router.post('/', authenticateUser, pathwayController.createPathway);
router.put('/:id', authenticateUser, pathwayController.updatePathway);
router.delete('/:id', authenticateUser, pathwayController.deletePathway);

module.exports = router;
