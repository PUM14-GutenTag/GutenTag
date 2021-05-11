import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Col } from 'react-bootstrap';
import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

const CreateProject = ({ toggleCallback }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(1);

  const submitHandler = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateProject(projectName, projectType);
    toggleCallback();
  };

  return (
    <div>
      <div className="create-container">
        <div>
          <Form onSubmit={submitHandler}>
            <Form.Group as={Form.Row} controlId="form.name">
              <Form.Label className="titleLabel">Project Name</Form.Label>
              <Col>
                <Form.Control
                  className="text"
                  type="text"
                  name="name"
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Enter project name..."
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Form.Row} controlId="form.select">
              <Form.Label className="titleLabel">Project Type</Form.Label>
              <Col>
                <Form.Control
                  className="text"
                  as="select"
                  name="type"
                  onChange={(event) => setProjectType(event.target.value)}
                >
                  <option value={ProjectType.DOCUMENT_CLASSIFICATION}>
                    Document classification
                  </option>
                  <option value={ProjectType.SEQUENCE_LABELING}>Sequence labeling</option>
                  <option value={ProjectType.SEQUENCE_TO_SEQUENCE}>
                    Sequence to sequence labeling
                  </option>
                  <option value={ProjectType.IMAGE_CLASSIFICATION}>Image classification</option>
                </Form.Control>
              </Col>
            </Form.Group>
            <Button className="dark" variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

CreateProject.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default CreateProject;
