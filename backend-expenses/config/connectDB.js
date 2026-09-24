const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize instance configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false, 
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully via Sequelize (MySQL)!');
    
   
    await sequelize.sync({ alter: true }); 
    console.log('📦 All Database tables synced successfully!');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };