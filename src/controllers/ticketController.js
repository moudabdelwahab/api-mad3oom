const Ticket = require("../models/Ticket");
const { validationResult } = require("express-validator");
const webhookService = require("../services/webhookService");

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, createdBy } = req.body;
    
    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      createdBy,
      managerId: req.manager.id, // Enforce isolation
      apiKeyId: req.apiKey ? req.apiKey.id : null
    });

    // Trigger Webhook 'ticket.created'
    webhookService.trigger("ticket.created", req.manager.id, ticket);
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { managerId: req.manager.id } // Enforce isolation
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, managerId: req.manager.id }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { subject, description, status, priority, assignedTo } = req.body;
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, managerId: req.manager.id }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    await ticket.update({
      subject: subject || ticket.subject,
      description: description || ticket.description,
      status: status || ticket.status,
      priority: priority || ticket.priority,
      assignedTo: assignedTo || ticket.assignedTo
    });

    // Trigger Webhook 'ticket.updated'
    webhookService.trigger("ticket.updated", req.manager.id, ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const result = await Ticket.destroy({
      where: { id: req.params.id, managerId: req.manager.id }
    });

    if (result === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
