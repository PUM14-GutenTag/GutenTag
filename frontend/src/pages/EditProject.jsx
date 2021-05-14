import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Col, Row } from 'react-bootstrap';
import Layout from '../components/Layout';
import ImportForm from '../components/ImportForm';
import ExportButton from '../components/ExportButton';
import ManageProjectUsers from '../components/ManageProjectUsers';

import '../css/editProject.css';
import HTTPLauncher from '../services/HTTPLauncher';

/*
 * Page for editing project settings, adding members and importing/exporting
 * files.
 */
const EditProject = ({ location }) => {
  const { id, name, projectType } = location.state;
  const [labelsPerDatapoint, setLabelsPerDatapoint] = useState(1);

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(labelsPerDatapoint);
    const response = await HTTPLauncher.sendChangeLabelsPerDatapoint(id, labelsPerDatapoint);
    console.log(response);
  };

  return (
    <Layout title="Edit project">
      <h1>Project: {name}</h1>
      <br />
      <Row>
        <Col id="center">
          <h2>Import</h2>
          <ImportForm projectID={id} projectType={projectType} />
        </Col>
        <Col id="center">
          <h2>Export</h2>
          <ExportButton projectID={id} projectType={projectType} fileName={name} />
        </Col>
      </Row>
      <Row>
        <Form onSubmit={submitHandler}>
          <Form.Group as={Col} controlId="formAmount">
            <Form.Label className="subTitleLabel">Labels per datapoint</Form.Label>
            <Form.Control
              className="text"
              as="select"
              name="amount"
              onChange={(event) => setLabelsPerDatapoint(event.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Form.Control>
            <Button className="dark editBtn" variant="primary" type="submit">
              Change
            </Button>
          </Form.Group>
        </Form>
      </Row>
      <ManageProjectUsers projectID={id} />
    </Layout>
  );
};

EditProject.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      projectType: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default EditProject;
