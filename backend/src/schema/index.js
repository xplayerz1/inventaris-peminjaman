const baseTypeDefs = require('./base.typeDefs');
const authTypeDefs = require('./auth.typeDefs');
const chatTypeDefs = require('./chat.typeDefs');
const loansTypeDefs = require('./loans.typeDefs');

const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  chatTypeDefs,
  loansTypeDefs,
];

module.exports = typeDefs;
