import React from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap';
import useForm from '../utils/useForm';

const Register = () => {
  const { values, updateValue } = useForm({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const submitRegisterForm = e => {
    e.preventDefault();
    console.log(values)
  }


  return (
    <Row className="bg-white py-5 justify-content-center">
        <Col sm={8} md={6} lg={4}>
          <h1 className="text-center">Register</h1>
          <Form onSubmit={submitRegisterForm}>
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" value={values.email} onChange={updateValue} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" value={values.username} onChange={updateValue}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={values.password} onChange={updateValue} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" name="confirmPassword" value={values.confirmPassword} onChange={updateValue}/>
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit">
                Register
              </Button>
            </div>
        </Form>
        </Col>
      </Row>
  )
}

export default Register
