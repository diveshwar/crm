'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customers', [
      {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        phone: '1234567890',
        totalSpend: 500,
        visitCount: 10,
        lastVisitDate: new Date(),
        status: 'active',
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'bob@example.com',
        name: 'Bob Smith',
        phone: '2345678901',
        totalSpend: 1200,
        visitCount: 25,
        lastVisitDate: new Date(),
        status: 'active',
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
};
