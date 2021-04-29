import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/createProject.css';

const CreateProject = ({ toggleCallback }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(1);
  const projectTypeEnum = Object.freeze({
    DocumentClassification: 1,
    SequenceLabeling: 2,
    SequenceToSequenceLabeling: 3,
    ImageClassification: 4,
  });

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
            <Form.Group controlId="form.name">
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
            <Form.Group controlId="form.select">
              <Form.Label className="titleLabel">Select Project Type</Form.Label>
              <Form.Control
                className="text"
                as="select"
                name="type"
                onChange={(event) => setProjectType(event.target.value)}
              >
                <option value={projectTypeEnum.DocumentClassification}>
                  Document classification
                </option>
                <option value={projectTypeEnum.SequenceLabeling}>Sequence labeling</option>
                <option value={projectTypeEnum.SequenceToSequenceLabeling}>
                  Sequence to sequence labeling
                </option>
                <option value={projectTypeEnum.ImageClassification}>Image classification</option>
              </Form.Control>
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
