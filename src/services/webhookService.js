const axios = require("axios");
const crypto = require("crypto");
const { Queue, Worker } = require("bullmq");
const Ioredis = require("ioredis");
const Webhook = require("../models/Webhook");

// Redis connection configuration
const redisConnection = new Ioredis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

class WebhookService {
  constructor() {
    this.queueName = "webhook-delivery";
    this.queue = new Queue(this.queueName, { connection: redisConnection });
    
    // Initialize Worker only if not in serverless/vercel environment
    // In Vercel, you'd typically use a background job service or a separate worker
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      this.initWorker();
    }
  }

  async trigger(eventType, managerId, payload) {
    try {
      const webhooks = await Webhook.findAll({
        where: { managerId, eventType, isActive: true }
      });

      for (const webhook of webhooks) {
        await this.queue.add(
          `webhook-${webhook.id}-${Date.now()}`,
          { webhookId: webhook.id, eventType, payload },
          {
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 5000, // 5s, 10s, 20s, 40s, 80s
            },
            removeOnComplete: true,
            removeOnFail: false, // Keep in DLQ for investigation
          }
        );
      }
    } catch (error) {
      console.error("Webhook trigger error:", error.message);
    }
  }

  initWorker() {
    const worker = new Worker(
      this.queueName,
      async (job) => {
        const { webhookId, eventType, payload } = job.data;
        const webhook = await Webhook.findByPk(webhookId);
        
        if (!webhook || !webhook.isActive) return;

        await this.sendWebhook(webhook, eventType, payload);
      },
      { connection: redisConnection, concurrency: 5 }
    );

    worker.on("failed", (job, err) => {
      console.error(`Webhook job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
    });
  }

  async sendWebhook(webhook, eventType, payload) {
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

    try {
      await axios.post(webhook.callbackUrl, data, { headers, timeout: 10000 });
      console.log(`Webhook successfully sent to ${webhook.callbackUrl}`);
    } catch (error) {
      throw new Error(`Delivery failed to ${webhook.callbackUrl}: ${error.message}`);
    }
  }
}

module.exports = new WebhookService();
