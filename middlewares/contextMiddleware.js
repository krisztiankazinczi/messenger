const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

module.exports = context => {
  let token;

  if (context.req && context.req.headers.authorization) {
    token = context.req.headers.authorization.split('Bearer ')[1];
  } else if (context.connection && context.connection.context.Authorization) {
    // if context has connection object, it means it's not a usual request, it's websocket
    // check also for Authorization header - in websocket we find it in the context Object
    token = context.connection.context.Authorization.split('Bearer ')[1];
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      context.user = decodedToken
      // itt ratesszuk a user-t a contextre, igy kesobb eleg lesz destrukturalni a usert a contextbol es ha nem letezik akkor nem authentikalt. Mehet az error!
    })
  }


  context.pubsub = pubsub;

  return context;
}