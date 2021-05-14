import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import { Trash } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';

const ManageDefaultLabels = ({ projectID }) => {
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState([]);

  const fetchDefaultLabels = async () => {
    const result = await HTTPLauncher.sendGetDefaultLabel(projectID);
    const list = Object.keys(result.data).map((key) => result.data[key].name);
    setLabels(list);
    console.log(labels);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const result = await HTTPLauncher.sendCreateDefaultLabel(label, projectID);
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
                <Trash className="remove" />
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
