const express = require("express");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - subject
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, in_progress, closed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         createdBy:
 *           type: string
 *         assignedTo:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const ticketController = require("../controllers/ticketController");
const { authenticateApiKey, checkPermission } = require("../middlewares/auth");

// All ticket routes require API Key authentication
router.use(authenticateApiKey);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *           example:
 *             subject: "Problem with login"
 *             description: "User cannot login with their credentials"
 *             priority: "high"
 *             createdBy: "John Doe"
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post("/", checkPermission("create"), ticketController.createTicket);
router.get("/", checkPermission("read"), ticketController.getTickets);
router.get("/:id", checkPermission("read"), ticketController.getTicketById);
router.put("/:id", checkPermission("update"), ticketController.updateTicket);
router.delete("/:id", checkPermission("update"), ticketController.deleteTicket);

module.exports = router;
