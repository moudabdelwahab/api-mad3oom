const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Ioredis = require("ioredis");

const redisClient = new Ioredis(process.env.REDIS_URL || "redis://localhost:6379");

const createApiKeyLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use API Key ID or Manager ID as the rate limit key
      return req.apiKey ? `ratelimit:apikey:${req.apiKey.id}` : `ratelimit:ip:${req.ip}`;
    },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    message: {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMinutes} minutes.`
    }
  });
};

module.exports = { createApiKeyLimiter };
