import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import HTTPLauncher from '../services/HTTPLauncher';

const AddUser = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(isAdmin);
    await HTTPLauncher.sendCreateUser(firstname, lastname, password, email, isAdmin);
  };
  const handleChange = (event) => {
    setIsAdmin(event.target.checked);
  };
  return (
    <div className="addUser-container">
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="form.text">
          <Form.Label className="firstname">Firstname:</Form.Label>
          <Form.Control
            type="text"
            name="firstname"
            onChange={(event) => setFirstname(event.target.value)}
            placeholder="Enter a name..."
            required
          />
          <Form.Label className="lastname">Lastname:</Form.Label>
          <Form.Control
            type="text"
            name="lastname"
            onChange={(event) => setLastname(event.target.value)}
            placeholder="Enter a lastname..."
            required
          />
          <Form.Label className="email">Email:</Form.Label>
          <Form.Control
            type="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter an email..."
            required
          />
          <Form.Label className="password">Password:</Form.Label>
          <Form.Control
            type="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a password..."
            required
          />
        </Form.Group>
        <Form.Group controlId="form.checkbox">
          <Form.Check type="checkbox" label="Admin" onChange={handleChange}></Form.Check>
        </Form.Group>
        <Button className="submitButton" variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};
export default AddUser;
