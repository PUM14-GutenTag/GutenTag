import React, { useState } from 'react';
import '../css/Login.css';

import { Button, Col, Row, Form } from 'react-bootstrap';

import logo from '../res/hat_dark.svg';

import HTTPLauncher from '../services/HTTPLauncher';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setValidated(true);
    const responseLogin = await HTTPLauncher.sendLogin(email, password);
    const token = responseLogin.data.access_token;

    localStorage.setItem('gutentag-accesstoken', JSON.stringify(token));
    window.location.href = 'http://localhost:3000/home';
  }

  return (
    <div className="login-wrapper">
      <img src={logo} alt="logo" className="login-logo" /> {/* Placeholder image. */}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group as={Row} className="text-right" controlId="formBasicEmail">
          <Col>
            <Form.Label className="text-label-big"> Email </Form.Label>
          </Col>
          <Col>
            <Form.Control
              required
              autoFocus
              size="lg"
              className="input-box"
              type="email"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please input a valid email.
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="text-right" controlId="formBasicPassword">
          <Col>
            <Form.Label className="text-label-big"> Password </Form.Label>
          </Col>
          <Col>
            <Form.Control
              required
              size="lg"
              className="input-box"
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">Please input a password.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Button
          size="lg"
          className="mx-auto"
          variant="login"
          type="submit"
          disabled={!validateForm()}
        >
          Login
        </Button>
      </Form>
    </div>
  );
}

export default Login;
