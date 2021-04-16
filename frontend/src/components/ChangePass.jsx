import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';
import HTTPLauncher from '../services/HTTPLauncher';

const ChangePass = ({ toggleCallback }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatNewPass, setRepeatNewPass] = useState('');
  const [validated, setValidated] = useState(false);

  const validateForm = () => {
    return newPass === repeatNewPass;
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (newPass === repeatNewPass) {
      await HTTPLauncher.sendChangePassword(currentPass, newPass);
    }
    toggleCallback();
  };

  return (
    <div>
      <div>
        <Form onSubmit={submitHandler} validated={validated}>
          <Form.Group controlId="form.old" inline>
            <Form.Label inline>Current password</Form.Label>
            <Form.Control
              type="password"
              onChange={(event) => setCurrentPass(event.target.value)}
              placeholder="Enter current password..."
              required
              inline
            />
          </Form.Group>
          <Form.Group controlId="form.new">
            <Form.Label>New password</Form.Label>
            <Form.Control
              type="password"
              onChange={(event) => setNewPass(event.target.value)}
              placeholder="Enter new password..."
              required
            />
          </Form.Group>
          <Form.Group controlId="form.repeat">
            <Form.Control
              type="password"
              onChange={(event) => setRepeatNewPass(event.target.value)}
              placeholder="Repeat new password..."
              required
            />
          </Form.Group>
          <Button
            className="submitButton"
            type="submit"
            disabled={!validateForm()}
          >
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
