const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Promisify the publish method
const publishAsync = promisify(client.publish).bind(client);

// Example function to publish to queue
async function publishToQueue(queueName, data) {
  try {
    await publishAsync(queueName, JSON.stringify(data));
    console.log(`Published to ${queueName}:`, data);
  } catch (error) {
    console.error('Error publishing to queue:', error);
  }
}

/**
 * Consume messages from a queue
 * @param {string} queueName - Name of the queue
 * @param {Function} processor - Function to process the message
 * @param {number} timeout - Timeout in seconds
 */
async function consumeQueue(queueName, processor, timeout = 0) {
  try {
    while (true) {
      const result = await brpop(queueName, timeout);
      if (result) {
        const [_, message] = result;
        const data = JSON.parse(message);
        await processor(data);
      }
    }
  } catch (error) {
    console.error(`Error consuming from queue ${queueName}:`, error);
    throw error;
  }
}

module.exports = {
  publishToQueue,
  consumeQueue
}; 