import React, { useEffect } from 'react'
import { Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { gql, useSubscription } from '@apollo/client';

import { useAuthDispatch, useAuthState } from '../context/auth';
import { useMessageDispatch } from '../context/message';

import Users from '../components/home/Users';
import Messages from '../components/home/Messages';

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;


export default function Home({ history }) {
  const authDispatch = useAuthDispatch();
  const { user } = useAuthState();
  const messageDispatch = useMessageDispatch();

  const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE);

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;

      const otherUser = user.username === message.to ? message.from : message.to

      messageDispatch({ type: 'ADD_MESSAGE', payload: {
        username: otherUser,
        message
      }})
    }
  }, [messageError, messageData]);

  const logout = () => {
    authDispatch({ type: 'LOGOUT' });
    window.location.href = '/login'
  }

  return (
    <>
        <Row className="justify-content-around mb-1">
        <Link to="/login">
          <Button variant="link">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="link">
            Register
          </Button>
        </Link>
          <Button variant="link" onClick={logout}>
            Logout
          </Button>
      </Row>
      <Row>
        <Users />
        <Messages />
      </Row>
    </>
    
  )
}
