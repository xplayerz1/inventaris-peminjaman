const { gql } = require('apollo-server-express');

const loansTypeDefs = gql`
  enum ConditionStatus {
    BAIK
    RUSAK
    HILANG
  }

  enum LoanStatus {
    pending
    approved
    active
    returned
    rejected
  }

  type Item {
    id: ID!
    name: String!
    code: String!
    category: String
    total_quantity: Int!
    available_quantity: Int!
    location: String
    condition_status: ConditionStatus!
    description: String
    image_url: String
    created_at: String!
    updated_at: String!
  }

  type Loan {
    id: ID!
    item_id: Int!
    user_id: Int!
    loan_date: String!
    planned_return_date: String!
    actual_return_date: String
    status: LoanStatus!
    notes: String
    admin_notes: String
    approved_by: Int
    approved_at: String
    created_at: String!
    updated_at: String!
    item: Item
    user: User
  }

  input CreateItemInput {
    name: String!
    code: String!
    category: String
    total_quantity: Int!
    available_quantity: Int!
    location: String
    condition_status: ConditionStatus
    description: String
    image_url: String
  }

  input UpdateItemInput {
    name: String
    code: String
    category: String
    total_quantity: Int
    available_quantity: Int
    location: String
    condition_status: ConditionStatus
    description: String
    image_url: String
  }

  input RequestLoanInput {
    item_id: Int!
    loan_date: String!
    planned_return_date: String!
    notes: String
  }

  input ApproveLoanInput {
    loan_id: Int!
    admin_notes: String
  }

  input RejectLoanInput {
    loan_id: Int!
    admin_notes: String!
  }

  input ReturnItemInput {
    loan_id: Int!
    actual_return_date: String!
    admin_notes: String
  }

  extend type Query {
    items: [Item!]!
    item(id: ID!): Item
    availableItems: [Item!]!
    
    myLoans: [Loan!]!
    allLoans: [Loan!]!
    pendingLoans: [Loan!]!
    activeLoans: [Loan!]!
    loan(id: ID!): Loan
  }

  extend type Mutation {
    createItem(input: CreateItemInput!): Item!
    updateItem(id: ID!, input: UpdateItemInput!): Item!
    deleteItem(id: ID!): Boolean!
    
    requestLoan(input: RequestLoanInput!): Loan!
    approveLoan(input: ApproveLoanInput!): Loan!
    rejectLoan(input: RejectLoanInput!): Loan!
    markAsReturned(input: ReturnItemInput!): Loan!
  }
`;

module.exports = loansTypeDefs;
