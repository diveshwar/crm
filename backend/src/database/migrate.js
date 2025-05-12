const sequelize = require('../config/database');
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');

async function migrate() {
  try {
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1);
  }
}

migrate(); 