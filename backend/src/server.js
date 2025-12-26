require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const { verifyToken } = require('./utils/jwt');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const authHeader = ctx.connectionParams?.authorization;
        let user = null;

        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          try {
            user = verifyToken(token);
          } catch (error) {
            console.error('WebSocket auth error:', error);
          }
        }

        return { user };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const authHeader = req.headers.authorization;
      let user = null;

      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        try {
          user = verifyToken(token);
        } catch (error) {
          // Token invalid
        }
      }

      return { req, user };
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  await server.start();

  server.applyMiddleware({ app, path: '/graphql' });

  app.get('/', (req, res) => {
    res.json({
      message: 'Inventaris GraphQL API with Real-time Chat',
      graphql: `http://localhost:${PORT}${server.graphqlPath}`,
      websocket: `ws://localhost:${PORT}${server.graphqlPath}`,
      version: '2.0.0',
    });
  });

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
