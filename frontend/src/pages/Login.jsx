import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import '../css/login.css';

import logoUnder from '../res/hat_dark_under.svg';

import HTTPLauncher from '../services/HTTPLauncher';
import userAuth from '../services/userAuth';

// Login-page redirects submitting login details, does not verify valid login credentials
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validEmail, setValidEmail] = useState(true);
  const [validPass, setValidPass] = useState(true);

  const history = useHistory();

  useEffect(() => {
    if (userAuth.hasAccessToken()) {
      history.push('/home');
    }
  }, [history]);

  // Checks the email and password length to be over 0
  const validateForm = () => {
    return email.length > 0 && password.length > 0;
  };

  // Gets acesstoken from database and saves in localstorage, then redirects
  const handleSubmit = async (event) => {
    event.preventDefault();

    const responseLogin = await HTTPLauncher.sendLogin(email, password);
    if (typeof responseLogin.status !== 'undefined' && responseLogin.status === 200) {
      history.push('/home');
    } else if (responseLogin.response.status === 404) {
      setValidEmail(false);
      setValidPass(true);
    } else if (responseLogin.response.status === 401) {
      setValidPass(false);
      setValidEmail(true);
    }
  };

  return (
    <div className="login-wrapper">
      <img src={logoUnder} alt="logo" className="login-logo" />
      <Form onSubmit={handleSubmit}>
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
            {!validEmail && <div className="red-text">Incorrect email</div>}
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
            {!validPass && <div className="red-text">Incorrect password</div>}
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
