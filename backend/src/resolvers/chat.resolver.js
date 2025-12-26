const { PubSub } = require('graphql-subscriptions');
const { inventoryPool, authPool } = require('../config/database');

const pubsub = new PubSub();

const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
const NEW_CONVERSATION = 'NEW_CONVERSATION';

const chatResolvers = {
  Query: {
    myConversation: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      if (context.user.role === 'admin') {
        throw new Error('Use allConversations for admin access');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM conversations WHERE user_id = $1',
        [context.user.userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const conversation = result.rows[0];

      const messages = await inventoryPool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversation.id]
      );

      return {
        ...conversation,
        messages: messages.rows,
      };
    },

    allConversations: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM conversations ORDER BY updated_at DESC'
      );

      const conversations = await Promise.all(
        result.rows.map(async (conv) => {
          const messages = await inventoryPool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [conv.id]
          );

          return {
            ...conv,
            messages: messages.rows,
          };
        })
      );

      return conversations;
    },

    conversationMessages: async (_, { conversation_id }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversation_id]
      );

      return result.rows;
    },
  },

  Mutation: {
    sendMessage: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const { conversation_id, user_id, message } = input;
      const isAdmin = context.user.role === 'admin';

      let convId = conversation_id;
      let recipientId = user_id;

      if (!convId) {
        if (isAdmin && !user_id) {
          throw new Error('user_id required for admin to start conversation');
        }

        if (!isAdmin) {
          recipientId = context.user.userId;
        }

        const existingConv = await inventoryPool.query(
          'SELECT id FROM conversations WHERE user_id = $1',
          [recipientId]
        );

        if (existingConv.rows.length > 0) {
          convId = existingConv.rows[0].id;
        } else {
          const userInfo = await authPool.query(
            'SELECT name FROM users WHERE id = $1',
            [recipientId]
          );

          const newConv = await inventoryPool.query(
            'INSERT INTO conversations (user_id, user_name) VALUES ($1, $2) RETURNING *',
            [recipientId, userInfo.rows[0]?.name || 'User']
          );

          convId = newConv.rows[0].id;

          pubsub.publish(NEW_CONVERSATION, {
            newConversation: newConv.rows[0],
          });
        }
      }

      const senderInfo = await authPool.query(
        'SELECT name FROM users WHERE id = $1',
        [context.user.userId]
      );

      const result = await inventoryPool.query(
        `INSERT INTO messages (conversation_id, sender_id, sender_role, sender_name, message)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [convId, context.user.userId, context.user.role, senderInfo.rows[0]?.name, message]
      );

      const newMessage = result.rows[0];

      await inventoryPool.query(
        `UPDATE conversations SET 
          last_message = $1, 
          last_message_at = NOW(),
          unread_count_user = CASE WHEN $2 = 'admin' THEN unread_count_user + 1 ELSE unread_count_user END,
          unread_count_admin = CASE WHEN $2 = 'user' THEN unread_count_admin + 1 ELSE unread_count_admin END
         WHERE id = $3`,
        [message, context.user.role, convId]
      );

      pubsub.publish(MESSAGE_RECEIVED, {
        messageReceived: newMessage,
        conversation_id: convId,
      });

      return newMessage;
    },

    markAsRead: async (_, { conversation_id }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const field = context.user.role === 'admin' ? 'unread_count_admin' : 'unread_count_user';

      await inventoryPool.query(
        `UPDATE conversations SET ${field} = 0 WHERE id = $1`,
        [conversation_id]
      );

      await inventoryPool.query(
        `UPDATE messages SET is_read = true 
         WHERE conversation_id = $1 AND sender_role != $2`,
        [conversation_id, context.user.role]
      );

      return true;
    },
  },

  Subscription: {
    messageReceived: {
      subscribe: (_, { conversation_id }) => {
        return pubsub.asyncIterator([MESSAGE_RECEIVED]);
      },
      resolve: (payload, { conversation_id }) => {
        if (payload.conversation_id === conversation_id) {
          return payload.messageReceived;
        }
        return null;
      },
    },

    newConversation: {
      subscribe: () => pubsub.asyncIterator([NEW_CONVERSATION]),
    },
  },
};

module.exports = { chatResolvers, pubsub };
