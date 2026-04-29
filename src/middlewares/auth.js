const jwt = require("jsonwebtoken");
const ApiKey = require("../models/ApiKey");

// JWT Auth for Managers (to manage their API keys) - assumes managerId comes from an external JWT
const authenticateManager = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // This JWT_SECRET should be shared with mad3oom.online or a public key used for verification
    
    // Assuming the decoded token contains a managerId field
    if (!decoded.managerId) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid manager token" });
    }

    req.manager = { id: decoded.managerId }; // Attach managerId to request object
    next();
  } catch (error) {
    console.error("Manager authentication error:", error.message);
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired manager token" });
  }
};

// API Key Auth for REST API Consumers
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers["x-api-key"];
    if (!apiKeyHeader) {
      return res.status(401).json({ error: "Unauthorized", message: "API Key is required" });
    }

    const apiKey = await ApiKey.findOne({
      where: { key: apiKeyHeader, isActive: true },
    });

    if (!apiKey) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid or inactive API Key" });
    }

    req.apiKey = apiKey;
    req.manager = { id: apiKey.managerId }; // Multi-tenant isolation context
    next();
  } catch (error) {
    console.error("API Key authentication error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Permission Check Middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.permissions[permission]) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: `Insufficient permissions. Required: ${permission}` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateManager,
  authenticateApiKey,
  checkPermission
};
