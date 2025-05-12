const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./Customer');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of action (e.g., create_campaign, create_segment, create_order)'
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of entity affected (e.g., campaign, segment, order)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the affected entity'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human-readable activity message'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional data about the activity'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['entityType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Define association
Activity.belongsTo(Customer, { foreignKey: 'userId', as: 'user' });

module.exports = Activity; 