import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import HTTPLauncher from '../services/HTTPLauncher';

const ManageDefaultLabels = ({ projectID }) => {
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState([]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const result = await HTTPLauncher.sendCreateDefaultLabel(label, projectID);
  };

  const fetchDefaultLabels = async () => {
    const result = await HTTPLauncher.sendGetDefaultLabel(projectID);
    console.log(result);
  };

  useEffect(() => {
    fetchDefaultLabels();
  }, []);

  return (
    <div>
      <h1>Add new default label</h1>
      <Form onSubmit={submitHandler}>
        <Form.Row>
          <Col style={{ justifyContent: 'center', paddingLeft: '0px' }}>
            <Form.Control
              className="text"
              type="text"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Enter new default label..."
              required
            />
          </Col>
          <Col style={{ alignItems: 'flex-start' }}>
            <Button className="dark" type="submit">
              Add
            </Button>
          </Col>
        </Form.Row>
      </Form>
    </div>
  );
};

ManageDefaultLabels.propTypes = {
  projectID: PropTypes.number.isRequired,
};

export default ManageDefaultLabels;
