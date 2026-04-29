const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { authenticateManager } = require("../middlewares/auth");

// Only managers can view audit logs
router.use(authenticateManager);

router.get("/", auditController.getLogs);

module.exports = router;
