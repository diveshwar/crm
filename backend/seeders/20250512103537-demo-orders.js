'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders', [
      {
        customerId: 1,
        amount: 250,
        status: 'completed',
        items: JSON.stringify([{ product: 'Widget A', qty: 2 }]),
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        customerId: 2,
        amount: 400,
        status: 'completed',
        items: JSON.stringify([{ product: 'Widget B', qty: 1 }]),
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};
