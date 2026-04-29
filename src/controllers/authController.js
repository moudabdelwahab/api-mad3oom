const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

exports.createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;
    
    // Generate a secure random key
    const prefix = "mad"; // mad3oom prefix
    const randomPart = crypto.randomBytes(24).toString("hex");
    const fullKey = `${prefix}_${randomPart}`;
    
    // Store only the hash and prefix
    const keyHash = ApiKey.hashKey(fullKey);
    
    const apiKey = await ApiKey.create({
      keyHash,
      keyPrefix: prefix,
      name,
      permissions: permissions || { read: true, create: false, update: false },
      managerId: req.manager.id,
      expiresAt: expiresAt || null
    });

    res.status(201).json({ 
      message: "API Key created successfully. Save this key, it will NOT be shown again.",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey, // ONLY SHOWN ONCE
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({ 
      where: { managerId: req.manager.id },
      attributes: ["id", "name", "permissions", "isActive", "createdAt", "expiresAt", "keyPrefix"]
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, isActive } = req.body;

    const apiKey = await ApiKey.findOne({
      where: { id, managerId: req.manager.id }
    });

    if (!apiKey) {
      return res.status(404).json({ error: "API Key not found" });
    }

    await apiKey.update({
      name: name || apiKey.name,
      permissions: permissions || apiKey.permissions,
      isActive: typeof isActive === 'boolean' ? isActive : apiKey.isActive
    });

    res.json({ 
      message: "API Key updated successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ApiKey.destroy({
      where: { id, managerId: req.manager.id }
    });

    if (result === 0) {
      return res.status(404).json({ error: "API Key not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
