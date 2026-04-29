const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");
const { authenticateManager } = require("../middlewares/auth");

// Only managers can manage webhooks
router.use(authenticateManager);

router.post("/", webhookController.createWebhook);
router.get("/", webhookController.listWebhooks);
router.delete("/:id", webhookController.deleteWebhook);

module.exports = router;
