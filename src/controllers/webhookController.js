const Webhook = require("../models/Webhook");

exports.createWebhook = async (req, res) => {
  try {
    const { eventType, callbackUrl, secret } = req.body;
    
    const webhook = await Webhook.create({
      eventType,
      callbackUrl,
      secret,
      managerId: req.manager.id, // Isolation
    });

    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.findAll({
      where: { managerId: req.manager.id }
    });
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWebhook = async (req, res) => {
  try {
    const result = await Webhook.destroy({
      where: { id: req.params.id, managerId: req.manager.id }
    });

    if (result === 0) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
