const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ApiKey = sequelize.define("ApiKey", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  managerId: {
    type: DataTypes.STRING, // Assuming managerId comes as a string/UUID from mad3oom.online
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
});

module.exports = ApiKey;
