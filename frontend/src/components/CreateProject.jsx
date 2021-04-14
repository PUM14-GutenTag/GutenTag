import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/createProject.css';

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
            <Form.Group controlId="form.name">
              <Form.Label className="titleLabel">Project Name:</Form.Label>
              <Form.Control
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
                as="select"
                name="type"
                onChange={(event) => setProjectType(event.target.value)}
              >
                <option value={1}>Document classification</option>
                <option value={2}>Sequence labeling</option>
                <option value={3}>sequence to sequence labeling</option>
                <option value={4}>Image classification</option>
              </Form.Control>
            </Form.Group>
            <Button className="submitButton" variant="primary" type="submit">
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
