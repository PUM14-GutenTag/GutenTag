import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

/* Component for creating a project */
const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(ProjectType.DOCUMENT_CLASSIFICATION);
  const [ID, setID] = useState();
  const [error, setError] = useState(false);

  // Creates a project in the backend
  const submitHandler = async (event) => {
    event.preventDefault();
    const response = await HTTPLauncher.sendCreateProject(projectName, projectType);
    if (response.data.id === null) {
      setError(true);
    }
    setID(response.data.id);
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
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Enter project name..."
              required
            />
          </Form.Group>
        </Row>
        {error && (
          <Row>
            <Form.Label className="red-text">Project name already exists</Form.Label>
          </Row>
        )}
        <Row>
          <Form.Group as={Col} controlId="formType">
            <Form.Label className="titleLabel">Project Type</Form.Label>
            <Form.Control
              className="text"
              as="select"
              name="type"
              value={projectType}
              onChange={(event) => setProjectType(parseInt(event.target.value, 10))}
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
          <Button className="dark" variant="primary" type="submit">
            Submit
          </Button>
          {ID && (
            <Redirect
              to={{
                pathname: '/edit-project',
                state: {
                  id: ID,
                  name: projectName,
                  projectType,
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
