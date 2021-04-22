import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import HTTPLauncher from '../services/HTTPLauncher';

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
        <Form.Group controlId="form.text">
          <Form.Label className="titleLabel">First name</Form.Label>
          <Form.Control
            className="text"
            type="text"
            name="firstname"
            onChange={(event) => setFirstname(event.target.value)}
            placeholder="Enter a name..."
            required
          />
          <Form.Label className="titleLabel">Last name</Form.Label>
          <Form.Control
            className="text"
            type="text"
            name="lastname"
            onChange={(event) => setLastname(event.target.value)}
            placeholder="Enter a last name..."
            required
          />
          <Form.Label className="titleLabel">Email</Form.Label>
          <Form.Control
            className="text"
            type="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter an email..."
            required
          />
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
        <Form.Group controlId="form.checkbox">
          <Form.Check type="checkbox" label="Admin" onChange={handleChange} />
        </Form.Group>
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
