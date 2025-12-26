const authResolvers = require('./auth.resolver');
const { chatResolvers } = require('./chat.resolver');
const loansResolvers = require('./loans.resolver');

const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...chatResolvers.Query,
    ...loansResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...loansResolvers.Mutation,
  },
  Subscription: {
    ...chatResolvers.Subscription,
  },
  Loan: loansResolvers.Loan,
};

module.exports = resolvers;
