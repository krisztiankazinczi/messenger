import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap';
import useForm from '../utils/useForm';
import { Link } from 'react-router-dom'


import { gql, useMutation } from '@apollo/client';

const REGISTER_USER = gql`
  mutation register(
    $username: String! 
    $email: String! 
    $password: String! 
    $confirmPassword: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirmPassword: $confirmPassword
  ) {
      username
      email
      createdAt
    }
  }
`;

const Register = (props) => {
  const { values, updateValue } = useForm({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update: (_, __) => props.history.push('/login'),
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors)
  });

  const submitRegisterForm = e => {
    e.preventDefault();

    registerUser({ variables: values })
  }


  return (
    <Row className="py-5 justify-content-center">
        <Col sm={8} md={6} lg={5} className="bg-white p-3" >
          <h1 className="text-center">Register</h1>
          <Form onSubmit={submitRegisterForm}>
            <Form.Group>
              <Form.Label className={errors.email && 'text-danger'}>{errors.email ?? 'Email address'}</Form.Label>
              <Form.Control type="email" name="email" value={values.email} onChange={updateValue} className={errors.email && 'is-invalid'} />
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.username && 'text-danger'}>{errors.username ?? 'Username'}</Form.Label>
              <Form.Control type="text" name="username" value={values.username} onChange={updateValue} className={errors.username && 'is-invalid'}/>
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
              <Form.Control type="password" name="password" value={values.password} onChange={updateValue} className={errors.password && 'is-invalid'} />
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.confirmPassword && 'text-danger'}>{errors.confirmPassword ?? 'Confirm password'}</Form.Label>
              <Form.Control type="password" name="confirmPassword" value={values.confirmPassword} onChange={updateValue} className={errors.confirmPassword && 'is-invalid'} />
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" disabled={loading}>
                { loading ? 'Loading...' : 'Register' }
              </Button>
              <br />
              <small>Already have an account? <Link to="/login">Login</Link></small>
            </div>
        </Form>
        </Col>
      </Row>
  )
}

export default Register
