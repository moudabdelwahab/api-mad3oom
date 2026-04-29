const axios = require("axios");
const crypto = require("crypto");
const Webhook = require("../models/Webhook");

class WebhookService {
  async trigger(eventType, managerId, payload) {
    try {
      const webhooks = await Webhook.findAll({
        where: { managerId, eventType, isActive: true }
      });

      for (const webhook of webhooks) {
        this.sendWebhook(webhook, eventType, payload);
      }
    } catch (error) {
      console.error("Webhook trigger error:", error.message);
    }
  }

  async sendWebhook(webhook, eventType, payload) {
    try {
      const timestamp = Date.now();
      const data = JSON.stringify({ eventType, timestamp, payload });
      
      const headers = {
        "Content-Type": "application/json",
        "X-Mad3oom-Event": eventType,
        "X-Mad3oom-Timestamp": timestamp,
      };

      if (webhook.secret) {
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(data)
          .digest("hex");
        headers["X-Mad3oom-Signature"] = signature;
      }

      await axios.post(webhook.callbackUrl, data, { headers, timeout: 5000 });
      console.log(`Webhook sent to ${webhook.callbackUrl} for event ${eventType}`);
    } catch (error) {
      console.error(`Failed to send webhook to ${webhook.callbackUrl}:`, error.message);
    }
  }
}

module.exports = new WebhookService();
