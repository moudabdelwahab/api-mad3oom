const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

const ApiKey = sequelize.define("ApiKey", {
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
  keyHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  keyPrefix: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      read: true,
      create: false,
      update: false,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  paranoid: true, // Enable Soft Delete
  timestamps: true,
});

// Utility to hash the key
ApiKey.hashKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

module.exports = ApiKey;
