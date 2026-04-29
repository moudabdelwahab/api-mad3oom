const AuditLog = require("../models/AuditLog");

exports.getLogs = async (req, res) => {
  try {
    const { action, entityType, entityId, limit = 50, offset = 0 } = req.query;
    
    const where = { managerId: req.manager.id };
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: logs.count,
      logs: logs.rows,
      limit,
      offset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
