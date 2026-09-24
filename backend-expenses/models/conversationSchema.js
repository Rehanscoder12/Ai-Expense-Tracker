const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectDB");
const User = require("./userSchema");

const Conversation = sequelize.define("Conversation", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    messages: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    lastActive: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: true });

Conversation.belongsTo(User, { foreignKey: "userId", as: "user" });

Conversation.prototype.addMessage = async function (role, content) {
    const messages = Array.isArray(this.messages) ? this.messages : [];
    messages.push({ role, content, timestamp: new Date() });
    this.messages = messages.slice(-20);
    this.lastActive = new Date();
    return this.save();
};

module.exports = Conversation;