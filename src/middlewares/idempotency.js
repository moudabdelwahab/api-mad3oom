const IdempotencyKey = require("../models/IdempotencyKey");

const idempotency = async (req, res, next) => {
  // Only apply to POST requests
  if (req.method !== 'POST') return next();

  const key = req.headers['idempotency-key'];
  if (!key) return next();

  try {
    const managerId = req.manager.id;
    const existingKey = await IdempotencyKey.findOne({
      where: { key, managerId, requestPath: req.path }
    });

    if (existingKey) {
      if (existingKey.responseStatus) {
        // Return cached response
        return res.status(existingKey.responseStatus).json(existingKey.responseBody);
      } else {
        // Request is still processing
        return res.status(409).json({ error: "Conflict", message: "Request with this idempotency key is already in progress." });
      }
    }

    // Create a new idempotency key record
    const newKey = await IdempotencyKey.create({
      key,
      managerId,
      requestPath: req.path,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24h
    });

    // Wrap res.json to capture the response
    const originalJson = res.json;
    res.json = function (body) {
      newKey.update({
        responseStatus: res.statusCode,
        responseBody: body
      }).catch(err => console.error("Idempotency update error:", err));
      
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error("Idempotency middleware error:", error);
    next();
  }
};

module.exports = idempotency;
