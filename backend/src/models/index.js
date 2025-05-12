const Campaign = require('./Campaign');
const CommunicationLog = require('./CommunicationLog');
const Customer = require('./Customer');
const Order = require('./Order');
const Segment = require('./Segment');
const Activity = require('./Activity');

// Associations
Campaign.hasMany(CommunicationLog, { foreignKey: 'campaignId' });
CommunicationLog.belongsTo(Campaign, { foreignKey: 'campaignId' });

Customer.hasMany(CommunicationLog, { foreignKey: 'customerId' });
CommunicationLog.belongsTo(Customer, { foreignKey: 'customerId' });

// (Add other associations as needed)

module.exports = {
  Campaign,
  CommunicationLog,
  Customer,
  Order,
  Segment,
  Activity,
}; 