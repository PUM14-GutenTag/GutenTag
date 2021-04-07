import React from 'react';
import '../css/Login.css';

import {Button, Col, Row, Form, Container} from 'react-bootstrap';

import logo from '../res/hat_dark.svg';

function doSomething(){
  console.log('Button clicked');
}

function Login() {
    return(
        <div className="login-wrapper">
          <img src={logo} alt="logo" className="login-logo" /> {/* Placeholder image. */}
          <Form>
            <Form.Group as={Row} className="text-right" controlId="formBasicName">
              <Col>
                <Form.Label className="text-label-big">
                  Name
                </Form.Label>
              </Col>
              <Col>
                <Form.Control size="lg" className="input-box" type="text" placeholder="Enter name" />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="text-right" controlId="formBasicPassword">
              <Col>
                <Form.Label className="text-label-big">
                  Password
                </Form.Label>
                </Col>  
              <Col>
                <Form.Control size="lg" className="input-box" type="password" placeholder="Enter password" />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formHorizontalCheck">
              <Col>
                <Row className="justify-content-center">
                  <Form.Check className="text-label-small" label="Stay logged in" />
                </Row>
              </Col>
            </Form.Group>
            <Button size="lg" className="mx-auto" variant="login" onClick={doSomething} >
              Login
            </Button>
          </Form>
          <div >
          </div>
        </div>
      )
    }

export default Login;
