const { gql } = require('apollo-server-express');

const chatTypeDefs = gql`
  type Message {
    id: ID!
    conversation_id: Int!
    sender_id: Int!
    sender_role: UserRole!
    sender_name: String!
    message: String!
    is_read: Boolean!
    created_at: String!
  }

  type Conversation {
    id: ID!
    user_id: Int!
    user_name: String!
    last_message: String
    last_message_at: String
    unread_count_user: Int!
    unread_count_admin: Int!
    messages: [Message!]!
  }

  input SendMessageInput {
    conversation_id: Int
    user_id: Int
    message: String!
  }

  extend type Query {
    myConversation: Conversation
    allConversations: [Conversation!]!
    conversationMessages(conversation_id: Int!): [Message!]!
  }

  extend type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    markAsRead(conversation_id: Int!): Boolean!
  }

  extend type Subscription {
    messageReceived(conversation_id: Int!): Message!
    newConversation: Conversation!
  }
`;

module.exports = chatTypeDefs;
