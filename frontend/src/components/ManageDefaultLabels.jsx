import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Button, Table } from 'react-bootstrap/';
import { Trash } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';

// Component for making and removing default labels.
const ManageDefaultLabels = ({ projectID }) => {
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState([]);

  // Fetch all default labels.
  const fetchDefaultLabels = async () => {
    const result = await HTTPLauncher.sendGetDefaultLabel(projectID);
    if (typeof result.status !== 'undefined' && result.status === 200) {
      const list = Object.keys(result.data).map((key) => result.data[key].name);
      setLabels(list);
    }
  };

  // Adds new default label.
  const submitHandler = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDefaultLabel(label, projectID);
    fetchDefaultLabels();
  };

  // Removes a default label.
  const removeLabel = async (labelName) => {
    await HTTPLauncher.sendDeleteDefaultLabel(projectID, labelName);
    fetchDefaultLabels();
  };

  useEffect(() => {
    fetchDefaultLabels();
  }, []);

  return (
    <div>
      <h1>Default labels</h1>
      <Form onSubmit={submitHandler}>
        <Form.Row>
          <Col id="col-cen-pad">
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
      <Table striped borderless hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th className="right">Remove</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((result) => (
            <tr key={result}>
              <td>{result}</td>
              <td className="right">
                <Trash className="remove" onClick={() => removeLabel(result)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

ManageDefaultLabels.propTypes = {
  projectID: PropTypes.number.isRequired,
};

export default ManageDefaultLabels;
