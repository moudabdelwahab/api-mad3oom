const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const IdempotencyKey = sequelize.define("IdempotencyKey", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  managerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestPath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  responseBody: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = IdempotencyKey;
