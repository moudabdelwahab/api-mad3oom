const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ApiKey = require("./ApiKey");

const Ticket = sequelize.define("Ticket", {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("open", "in_progress", "closed"),
    defaultValue: "open",
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  paranoid: true, // Enable Soft Delete
  timestamps: true,
});

Ticket.belongsTo(ApiKey, { foreignKey: "apiKeyId", as: "apiKey" });

module.exports = Ticket;
