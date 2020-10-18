import React, { useState } from 'react'
import { Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { useAuthDispatch } from '../context/auth';

import Users from '../components/home/Users';
import Messages from '../components/home/Messages';


export default function Home({ history }) {
  const dispatch = useAuthDispatch();
  const [selectedUser, setSelectedUser] = useState(null);

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    window.location.href('/login')
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
