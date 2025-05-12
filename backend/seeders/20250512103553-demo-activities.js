'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('activities', [
      {
        userId: 1,
        action: 'create_order',
        entityType: 'order',
        entityId: 1,
        message: 'Order #1 created by Alice Johnson',
        metadata: JSON.stringify({ amount: 250 }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2,
        action: 'create_order',
        entityType: 'order',
        entityId: 2,
        message: 'Order #2 created by Bob Smith',
        metadata: JSON.stringify({ amount: 400 }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('activities', null, {});
  }
};
