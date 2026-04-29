const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

exports.createApiKey = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const key = crypto.randomBytes(32).toString("hex");
    
    // managerId comes from the authenticated manager via JWT from mad3oom.online
    const apiKey = await ApiKey.create({
      key,
      name,
      permissions: permissions || { read: true, create: false, update: false },
      managerId: req.manager.id
    });

    res.status(201).json({ 
      message: "API Key created successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: key, // Only show once for security
        permissions: apiKey.permissions,
        managerId: apiKey.managerId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listApiKeys = async (req, res) => {
  try {
    // managerId comes from the authenticated manager via JWT from mad3oom.online
    const keys = await ApiKey.findAll({ 
      where: { managerId: req.manager.id },
      attributes: ["id", "name", "permissions", "isActive", "createdAt", "managerId"]
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
      where: { id, managerId: req.manager.id } // Ensure manager owns the API key
    });

    if (!apiKey) {
      return res.status(404).json({ error: "API Key not found or you don't have permission to update it" });
    }

    apiKey.name = name || apiKey.name;
    apiKey.permissions = permissions || apiKey.permissions;
    apiKey.isActive = typeof isActive === 'boolean' ? isActive : apiKey.isActive;

    await apiKey.save();

    res.json({ 
      message: "API Key updated successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive,
        managerId: apiKey.managerId
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
      where: { id, managerId: req.manager.id } // Ensure manager owns the API key
    });

    if (result === 0) {
      return res.status(404).json({ error: "API Key not found or you don't have permission to delete it" });
    }

    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
