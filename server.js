const { ApolloServer } = require('apollo-server');
const { sequelize } = require('./models/');

const resolver = require('./graphql/resolvers');
const typeDef = require('./graphql/typeDefs');

// The GraphQL schema
const typeDefs = typeDef;

// A map of functions which return data for the schema.
const resolvers = resolver;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err))
});