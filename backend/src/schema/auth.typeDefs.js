const { gql } = require('apollo-server-express');

const authTypeDefs = gql`
  enum UserRole {
    admin
    user
  }

  type User {
    id: ID!
    email: String!
    role: UserRole!
    name: String!
    nim: String
    phone: String
    organization: String
    is_active: Boolean!
    created_at: String!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    nim: String
    phone: String
    organization: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User!
    users: [User!]!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
    logout: Boolean!
  }
`;

module.exports = authTypeDefs;
