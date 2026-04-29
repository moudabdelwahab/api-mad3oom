const AuditLog = require("../models/AuditLog");

class AuditService {
  async log(req, action, entityType, entityId, oldData = null, newData = null) {
    try {
      await AuditLog.create({
        managerId: req.manager.id,
        apiKeyId: req.apiKey ? req.apiKey.id : null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        oldData,
        newData,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
    } catch (error) {
      console.error("Audit logging error:", error.message);
      // We don't throw here to avoid breaking the main request flow
    }
  }
}

module.exports = new AuditService();
