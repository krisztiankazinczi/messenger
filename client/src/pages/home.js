import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { gql, useQuery, useLazyQuery } from '@apollo/client'

import { useAuthDispatch } from '../context/auth';

const GET_USERS = gql`
  query getUsers {
    getUsers{
      username 
      createdAt 
      imageUrl
      latestMessage {
        uuid 
        from 
        to 
        content 
        createdAt
      }
    }
  }
`;

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function Home({ history }) {
  const dispatch = useAuthDispatch();
  const [selectedUser, setSelectedUser] = useState(null);

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    history.push('/login');
  }

  const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES);
  const { loading, data, error } = useQuery(GET_USERS)

  useEffect(() => {
    if (selectedUser) {
      getMessages({ variables: { from: selectedUser } })
    }
  }, [selectedUser])

  if (messagesData) console.log(messagesData);



  if (error) {
    console.log(error)
  }

  if (data) {
    console.log(data)
  }

  if (loading) {
    console.log(loading)
  }

  let usersMarkup;
  if (!data || loading) {
    usersMarkup = <p>Loading...</p>
  } else if (!data.getUsers.length) {
    usersMarkup = <p>No users have joined yet.</p>
  }else if (data.getUsers.length) {
    usersMarkup = data.getUsers.map(user => (
      <div key={user.username} className="d-flex p-3" onClick={() => setSelectedUser(user.username)}>
        <Image src={user.imageUrl} roundedCircle className="mr-2" style={{width: 50, height: 50, objectFit: 'cover'}} />
        <div>
          <p className="text-success">{user.username}</p>
          <p className="font-weight-light">
            { user.latestMessage ? user.latestMessage.content : `You are now connected to ${user.username}` }
          </p>
        </div>
      </div>
    ))
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
        <Col xs={4} className="p-0 bg-secondary">
          {usersMarkup}
        </Col>
        <Col xs={8}>
          <p>
            {messagesData && messagesData.getMessages.length ? (
              messagesData.getMessages.map(message => (
              <p key={message.uuid}>{message.content}</p>
            ))
            ) : (
              <p>You are now connected to {selectedUser}</p>
            )}
          </p>
        </Col>
      </Row>
    </>
    
  )
}
