import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap';
import useForm from '../utils/useForm';
import { Link } from 'react-router-dom'

import { gql, useLazyQuery } from '@apollo/client';

import { useAuthDispatch } from '../context/auth';

const LOGIN_USER = gql`
  query login(
    $username: String! 
    $password: String! 
  ) {
    login(
      username: $username
      password: $password
  ) {
      username
      email
      createdAt
      token
    }
  }
`;

const Login = (props) => {
  const { values, updateValue } = useForm({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const dispatch = useAuthDispatch();

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    onCompleted: (data) => {
      dispatch({ type: 'LOGIN', payload: data.login })
      props.history.push('/')
    }
  });

  const submitLoginForm = e => {
    e.preventDefault();

    loginUser({ variables: values })
  }


  return (
    <Row className="py-5 justify-content-center">
        <Col sm={8} md={6} lg={5} className="bg-white p-3" >
          <h1 className="text-center">Login</h1>
          <Form onSubmit={submitLoginForm}>
            <Form.Group>
              <Form.Label className={errors.username && 'text-danger'}>{errors.username ?? 'Username'}</Form.Label>
              <Form.Control type="text" name="username" value={values.username} onChange={updateValue} className={errors.username && 'is-invalid'}/>
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
              <Form.Control type="password" name="password" value={values.password} onChange={updateValue} className={errors.password && 'is-invalid'} />
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" disabled={loading}>
                { loading ? 'Loading...' : 'Login' }
              </Button>
              <br />
              <small>Don't have an account? <Link to="/register">Register</Link></small>
            </div>
        </Form>
        </Col>
      </Row>
  )
}

export default Login
