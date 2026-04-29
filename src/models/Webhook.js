const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Webhook = sequelize.define("Webhook", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  managerId: {
    type: DataTypes.STRING, // External Manager ID from mad3oom.online
    allowNull: false,
  },
  eventType: {
    type: DataTypes.ENUM("ticket.created", "ticket.updated", "ticket.deleted"),
    allowNull: false,
  },
  callbackUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Webhook;
