const Customer = require('../models/Customer');
const { consumeQueue } = require('./queue');

/**
 * Process a single customer record
 * @param {Object} customerData - Customer data to process
 */
async function processCustomer(customerData) {
  try {
    const [customer, created] = await Customer.findOrCreate({
      where: { email: customerData.email },
      defaults: customerData
    });

    if (!created) {
      await customer.update(customerData);
    }

    console.log(`Processed customer: ${customer.email}`);
  } catch (error) {
    console.error('Error processing customer:', error);
    throw error;
  }
}

/**
 * Process a batch of customer records
 * @param {Array} customers - Array of customer data to process
 */
async function processCustomerBatch(customers) {
  try {
    const results = await Promise.allSettled(
      customers.map(customer => processCustomer(customer))
    );

    const stats = {
      total: customers.length,
      succeeded: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };

    console.log('Batch processing stats:', stats);
  } catch (error) {
    console.error('Error processing customer batch:', error);
    throw error;
  }
}

// Start consuming from queues
async function startConsumers() {
  try {
    // Start single customer consumer
    consumeQueue('customer_ingestion', processCustomer).catch(console.error);

    // Start batch customer consumer
    consumeQueue('customer_batch_ingestion', processCustomerBatch).catch(console.error);

    console.log('Customer consumers started successfully');
  } catch (error) {
    console.error('Error starting consumers:', error);
    process.exit(1);
  }
}

module.exports = {
  startConsumers
}; 