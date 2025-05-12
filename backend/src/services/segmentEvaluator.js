const { Op } = require('sequelize');
const Customer = require('../models/Customer');

/**
 * Evaluate a single condition against customer data
 * @param {Object} condition - The condition to evaluate
 * @param {Object} customer - The customer data
 * @returns {boolean} - Whether the condition is met
 */
function evaluateCondition(condition, customer) {
  const { field, operator, value } = condition;

  switch (operator) {
    case 'eq':
      return customer[field] === value;
    case 'neq':
      return customer[field] !== value;
    case 'gt':
      return customer[field] > value;
    case 'gte':
      return customer[field] >= value;
    case 'lt':
      return customer[field] < value;
    case 'lte':
      return customer[field] <= value;
    case 'contains':
      return customer[field].includes(value);
    case 'in':
      return value.includes(customer[field]);
    default:
      return false;
  }
}

/**
 * Build Sequelize where clause from segment rules
 * @param {Object} rules - The segment rules
 * @returns {Object} - Sequelize where clause
 */
function buildWhereClause(rules) {
  if (!rules || !rules.conditions) {
    return {};
  }

  const { conditions, operator = 'AND' } = rules;
  const whereClause = {};

  conditions.forEach(condition => {
    const { field, operator: op, value } = condition;
    let sequelizeOperator;

    switch (op) {
      case 'eq':
        sequelizeOperator = Op.eq;
        break;
      case 'neq':
        sequelizeOperator = Op.ne;
        break;
      case 'gt':
        sequelizeOperator = Op.gt;
        break;
      case 'gte':
        sequelizeOperator = Op.gte;
        break;
      case 'lt':
        sequelizeOperator = Op.lt;
        break;
      case 'lte':
        sequelizeOperator = Op.lte;
        break;
      case 'contains':
        sequelizeOperator = Op.like;
        value = `%${value}%`;
        break;
      case 'in':
        sequelizeOperator = Op.in;
        break;
      default:
        return;
    }

    if (operator === 'AND') {
      whereClause[field] = { [sequelizeOperator]: value };
    } else {
      whereClause[Op.or] = whereClause[Op.or] || [];
      whereClause[Op.or].push({ [field]: { [sequelizeOperator]: value } });
    }
  });

  return whereClause;
}

/**
 * Evaluate segment rules and return matching customers
 * @param {Object} rules - The segment rules
 * @returns {Promise<number>} - Number of matching customers
 */
async function evaluateSegmentRules(rules) {
  try {
    const whereClause = buildWhereClause(rules);
    const count = await Customer.count({ where: whereClause });
    return count;
  } catch (error) {
    console.error('Error evaluating segment rules:', error);
    throw error;
  }
}

/**
 * Get customers matching segment rules
 * @param {Object} rules - The segment rules
 * @param {Object} options - Query options (pagination, etc.)
 * @returns {Promise<Array>} - Array of matching customers
 */
async function getMatchingCustomers(rules, options = {}) {
  try {
    const whereClause = buildWhereClause(rules);
    const customers = await Customer.findAll({
      where: whereClause,
      ...options
    });
    return customers;
  } catch (error) {
    console.error('Error getting matching customers:', error);
    throw error;
  }
}

module.exports = {
  evaluateSegmentRules,
  getMatchingCustomers
}; 