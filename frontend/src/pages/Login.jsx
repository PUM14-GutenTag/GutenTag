import React from 'react';
import '../css/Login.css';

import Form from 'react-bootstrap/Form';

import logo from '../res/hat_dark.svg';

function Login() {
    return(
        <div className="login-wrapper">
          <img src={logo} alt="logo" className="login-logo" />
          <form>
            <Form.Group controlId="formBasicName">
              <Form.Label className="text-label" >Name</Form.Label>
              <Form.Control className="input-box" type="text" placeholder="Enter name" />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label className="text-label">Password</Form.Label>
              <Form.Control className="input-box" type="password" placeholder="Enter password" />
            </Form.Group> 
            <Form.Group controlId="formBasicCheckbox">
              <Form.Check style={{fontSize: '20px'}} className="text-label" type="checkbox" label="Check me out" />
            </Form.Group>
          </form>
        </div>
      )
    }

export default Login;