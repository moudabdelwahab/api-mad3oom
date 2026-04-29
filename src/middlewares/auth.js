const jwt = require("jsonwebtoken");
const ApiKey = require("../models/ApiKey");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Load Public Key for RS256
const publicKey = fs.readFileSync(path.join(__dirname, "../../keys/public.pem"), "utf8");

// JWT Auth for Managers using RS256
const authenticateManager = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify using RS256 and Public Key
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] }); 
    
    if (!decoded.managerId) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid manager token" });
    }

    req.manager = { id: decoded.managerId };
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired manager token" });
  }
};

// API Key Auth with Secure Hashing
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers["x-api-key"];
    if (!apiKeyHeader) {
      return res.status(401).json({ error: "Unauthorized", message: "API Key is required" });
    }

    // Secure extraction: prefix_actualkey
    const [prefix, actualKey] = apiKeyHeader.includes('_') ? apiKeyHeader.split('_') : [null, apiKeyHeader];
    
    if (!prefix) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid API Key format" });
    }

    const keyHash = ApiKey.hashKey(apiKeyHeader);

    const apiKey = await ApiKey.findOne({
      where: { 
        keyHash, 
        isActive: true,
        keyPrefix: prefix
      },
    });

    if (!apiKey) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid or inactive API Key" });
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return res.status(401).json({ error: "Unauthorized", message: "API Key has expired" });
    }

    req.apiKey = apiKey;
    req.manager = { id: apiKey.managerId }; // Enforce Multi-tenant isolation context
    next();
  } catch (error) {
    console.error("API Key authentication error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
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
