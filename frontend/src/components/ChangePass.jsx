import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';

import HTTPLauncher from '../services/HTTPLauncher';

/**
 * Component to change the logged in users password. user must
 * provide current password and repeat the new password.
 */
const ChangePass = ({ toggleCallback }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatNewPass, setRepeatNewPass] = useState('');
  const [passValid, setPassValid] = useState(true);

  // Checks if the repeated new password matches the new password.
  const validateForm = () => {
    return newPass === repeatNewPass;
  };

  // Sends change password request to backend.
  const submitHandler = async (event) => {
    event.preventDefault();
    if (validateForm) {
      const response = await HTTPLauncher.sendChangePassword(currentPass, newPass);
      if (response.data.message === 'Password changed succesfully') {
        toggleCallback();
      }
      setPassValid(false);
    }
  };

  return (
    <div>
      <div className="create-container">
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="form.old">
            <Form.Label className="titleLabel">Current password</Form.Label>
            <Form.Control
              className="text"
              type="password"
              onChange={(event) => setCurrentPass(event.target.value)}
              placeholder="Enter current password..."
              required
            />
            {!passValid && <div className="red-text">Password invalid!</div>}
          </Form.Group>
          <Form.Group controlId="form.new">
            <Form.Label className="titleLabel">New password</Form.Label>
            <Form.Control
              className="text"
              type="password"
              onChange={(event) => setNewPass(event.target.value)}
              placeholder="Enter new password..."
              required
            />
          </Form.Group>
          <Form.Group controlId="form.repeat">
            <Form.Control
              className="text"
              type="password"
              onChange={(event) => setRepeatNewPass(event.target.value)}
              placeholder="Repeat new password..."
              required
            />
            {!validateForm() && <div className="red-text">Passwords do not match!</div>}
          </Form.Group>
          <Button className="submitButton" type="submit">
            Save
          </Button>
        </Form>
      </div>
    </div>
  );
};

ChangePass.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default ChangePass;
