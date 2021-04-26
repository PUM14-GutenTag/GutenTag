import React, { useState } from 'react';
import { Button, Col, Row, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import '../css/login.css';

import logoUnder from '../res/hat_dark_under.svg';
import HTTPLauncher from '../services/HTTPLauncher';
import { useUser } from '../contexts/UserContext';

// Login-page redirects submitting login details, does not verify valid login credentials
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  const { dispatch: userDispatch } = useUser();
  const history = useHistory();

  // Checks the email and password length to be over 0
  const validateForm = () => {
    return email.length > 0 && password.length > 0;
  };

  // Gets acesstoken from database and saves in localstorage, then redirects
  const handleSubmit = async (event) => {
    event.preventDefault();

    setValidated(true);
    const responseLogin = await HTTPLauncher.sendLogin(email, password);
    const { access_token: token, access_level: accessLevel } = responseLogin.data;
    userDispatch({ type: 'SET_IS_ADMIN', value: accessLevel >= 5 });
    localStorage.setItem('gutentag-accesstoken', token);

    history.push('/home');
  };

  return (
    <div className="login-wrapper">
      <img src={logoUnder} alt="logo" className="login-logo" />
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
              className="text"
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
              className="text"
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">Please input a password.</Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Button className="dark" id="button-center" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>
    </div>
  );
}

export default Login;
