const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateManager } = require('../middlewares/auth');

// Routes for API Key management (protected by manager authentication)
router.post('/keys', authenticateManager, authController.createApiKey);
router.get('/keys', authenticateManager, authController.listApiKeys);
router.put('/keys/:id', authenticateManager, authController.updateApiKey);
router.delete('/keys/:id', authenticateManager, authController.deleteApiKey);

module.exports = router;
