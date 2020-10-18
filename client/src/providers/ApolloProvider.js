import React from 'react'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
  split
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';


let httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});


const authLink = setContext((_, { headers }) => {
  // this will run every time a mutation or query runs!!!!! In this case our token always will be updated
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

httpLink = authLink.concat(httpLink);

// this happens only once when page is loading first!!! the subscription is not good because of it
// because of it I redirect on login page, just in case it should reloadwith corect data for sure
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
});

// this split will check if it is a query or subscription and it will use the proper connection in every query or mutatuion
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default function ApolloProvider(props) {
  return <Provider client={client} {...props} />
}