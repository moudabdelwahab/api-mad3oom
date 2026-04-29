const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  managerId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true,
  },
  apiKeyId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING, // e.g., 'TICKET_CREATE', 'API_KEY_DELETE'
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING, // e.g., 'Ticket', 'ApiKey'
    allowNull: false,
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  oldData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false, // Audit logs are immutable
});

module.exports = AuditLog;
