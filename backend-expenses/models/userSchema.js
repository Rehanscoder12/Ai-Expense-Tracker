const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectDB");

const User = sequelize.define("User", {
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("email", value.trim().toLowerCase());
        },
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: true });

module.exports = User;