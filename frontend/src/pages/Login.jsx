import React, { useState } from 'react';
import '../css/Login.css';

import { Button, Col, Row, Form } from 'react-bootstrap';

import logo from '../res/hat_dark.svg';

import HTTPLauncher from '../services/HTTPLauncher';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const responseLogin = await HTTPLauncher.sendLogin(email, password);
    const token = responseLogin.data.access_token;
    localStorage.setItem('gutentag-accesstoken', JSON.stringify(token));
  }

  return (
    <div className="login-wrapper">
      <img src={logo} alt="logo" className="login-logo" /> {/* Placeholder image. */}
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="text-right" controlId="formBasicName">
          <Col>
            <Form.Label className="text-label-big"> Name </Form.Label>
          </Col>
          <Col>
            <Form.Control
              autoFocus
              size="lg"
              className="input-box"
              type="text"
              placeholder="Enter name"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="text-right" controlId="formBasicPassword">
          <Col>
            <Form.Label className="text-label-big"> Password </Form.Label>
          </Col>
          <Col>
            <Form.Control
              size="lg"
              className="input-box"
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formHorizontalCheck">
          <Col>
            <Row className="justify-content-center">
              <Form.Check className="text-label-small" label="Stay logged in" />
            </Row>
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
