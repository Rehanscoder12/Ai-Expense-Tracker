const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectDB");
const User = require("./userSchema");

const Transaction = sequelize.define("Transaction", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM("income", "expense"), allowNull: false, defaultValue: "expense" },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: true });

Transaction.belongsTo(User, { foreignKey: "userId" });

module.exports = Transaction;