import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import HTTPLauncher from '../services/HTTPLauncher';

// Admin can register new users.
const AddUser = ({ toggleBack }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateUser(firstname, lastname, password, email, isAdmin);
    toggleBack();
  };

  const handleChange = (event) => {
    setIsAdmin(event.target.checked);
  };

  return (
    <div className="create-container">
      <Form onSubmit={submitHandler}>
        <Row>
          <Form.Group as={Col} controlId="formFirstname">
            <Form.Label className="titleLabel">First name</Form.Label>
            <Form.Control
              className="text"
              type="text"
              name="firstname"
              onChange={(event) => setFirstname(event.target.value)}
              placeholder="Enter a name..."
              required
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} controlId="formLastname">
            <Form.Label className="titleLabel">Last name</Form.Label>
            <Form.Control
              className="text"
              type="text"
              name="lastname"
              onChange={(event) => setLastname(event.target.value)}
              placeholder="Enter a last name..."
              required
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} controlId="formEmail">
            <Form.Label className="titleLabel">Email</Form.Label>
            <Form.Control
              className="text"
              type="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter an email..."
              required
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} controlId="formPassword">
            <Form.Label className="titleLabel">Password</Form.Label>
            <Form.Control
              className="text"
              type="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a password..."
              required
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} controlId="formAdmin">
            <Form.Check
              className="checkbox"
              type="checkbox"
              label="Admin"
              onChange={handleChange}
            />
          </Form.Group>
        </Row>

        <Button className="dark" variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

AddUser.propTypes = {
  toggleBack: PropTypes.func.isRequired,
};

export default AddUser;
