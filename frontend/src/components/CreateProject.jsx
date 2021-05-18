import React, { useEffect, useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';
import InputSpinner from './InputSpinner';
/* Component for creating a project */
const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(1);
  const [labelsPerDatapoint, setLabelsPerDatapoint] = useState(1);
  const [ID, setID] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(false);

  // When we get an ID we redirect to edit that project
  useEffect(() => {
    if (ID !== null) setRedirect(true);
  }, [ID]);

  // Creates a project in the backend
  const submitHandler = async (event) => {
    event.preventDefault();
    const response = await HTTPLauncher.sendCreateProject(
      projectName,
      projectType,
      labelsPerDatapoint
    );
    if (response.data.id === null) {
      setError(true);
    }
    setID(response.data.id);
  };

  const sendChange = async (amount) => {
    setLabelsPerDatapoint(amount);
  };

  return (
    <div className="create-container">
      <Form onSubmit={submitHandler}>
        <Row>
          <Form.Group as={Col} controlId="form.name">
            <Form.Label className="titleLabel">Project Name</Form.Label>
            <Form.Control
              className="text"
              type="text"
              name="name"
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Enter project name..."
              required
            />
          </Form.Group>
        </Row>
        {error && (
          <Row>
            <Form.Label>Project name already exists</Form.Label>
          </Row>
        )}
        <Row>
          <Form.Group as={Col} controlId="formType">
            <Form.Label className="titleLabel">Project Type</Form.Label>
            <Form.Control
              className="text"
              as="select"
              name="type"
              onChange={(event) => setProjectType(event.target.value)}
            >
              <option value={ProjectType.DOCUMENT_CLASSIFICATION}>Document classification</option>
              <option value={ProjectType.SEQUENCE_LABELING}>Sequence labeling</option>
              <option value={ProjectType.SEQUENCE_TO_SEQUENCE}>
                Sequence to sequence labeling
              </option>
              <option value={ProjectType.IMAGE_CLASSIFICATION}>Image classification</option>
            </Form.Control>
          </Form.Group>
        </Row>
        <Row>
          <div>
            <Form.Label className="titleLabel">Labels per datapoint</Form.Label>
            <InputSpinner amount={labelsPerDatapoint} setAmount={sendChange} />
          </div>
        </Row>
        <Row>
          <Button className="dark" variant="primary" type="submit">
            Submit
          </Button>
          {redirect && (
            <Redirect
              to={{
                pathname: '/edit-project',
                state: {
                  id: ID,
                  name: projectName,
                  projectType: parseInt(projectType, 10),
                  labelsPerDatapoint: parseInt(labelsPerDatapoint, 10),
                },
              }}
            />
          )}
        </Row>
      </Form>
    </div>
  );
};

export default CreateProject;
