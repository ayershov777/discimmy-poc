const router = require('express').Router();
const aiController = require('../controllers/ai.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// All AI routes require authentication
router.use(authenticateUser);

// Generate/enhance pathway properties
router.post('/generate-pathway-properties', aiController.generatePathwayProperties);

// Generate/enhance module properties
router.post('/generate-module-properties', aiController.generateModuleProperties);

// Generate pathway structure based on user prompt
router.post('/generate-pathway-structure', aiController.generatePathwayStructure);

// Apply a previously generated pathway structure
router.post('/apply-pathway-structure', aiController.applyPathwayStructure);

module.exports = router;
