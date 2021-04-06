import React from 'react';
import '../css/Login.css';

import {Col, Row, Form} from 'react-bootstrap';

import logo from '../res/hat_dark.svg';

function Login() {
    return(
        <div className="login-wrapper">
          <img src={logo} alt="logo" className="login-logo" />
          <Form>
            <Form.Group as={Row} className="text-right" controlId="formBasicName">
              <Col>
                <Form.Label column="lg" lg={3} className="text-label-big">
                  Name
                </Form.Label>
              </Col>
              <Col>
                <Form.Control size="lg" className="input-box" type="text" placeholder="Enter name" />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="text-right" controlId="formBasicPassword">
              <Col>
                <Form.Label column="lg" lg={4} className="text-label-big">
                  Password
                </Form.Label>
                </Col>  
              <Col>
                <Form.Control size="lg" className="input-box" type="password" placeholder="Enter password" />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formHorizontalCheck">
              <Col sm={{ span: 10, offset: 3 }}>
                <Form.Check className="text-label-small" label="Stay logged in" />
              </Col>
            </Form.Group>
          </Form>
        </div>
      )
    }

export default Login;