import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/CreateProject.css';

const CreateProject = ({ toggleCallback }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateProject(projectName, parseInt(projectType));
    await HTTPLauncher.sendAddNewData(1, 1, 'hej');
    toggleCallback();
  };
  const register = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendRegister('Oscar', 'last_name', 'email', 'passwords', true);
  };
  const login = async (event) => {
    event.preventDefault();
    const responseLogin = await HTTPLauncher.sendLogin('email', 'passwords');
    localStorage.setItem('gutentag-accesstoken', responseLogin.data.access_token);
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
                defaultValue="1"
              >
                <option value="0">Text classification</option>
                <option value="1">Image classification</option>
                <option value="2">Sequence to Sequence</option>
                <option value="3">Sequence labeling</option>
              </Form.Control>
            </Form.Group>
            <Button className="submitButton" variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </div>
      <div className="buttons">
        <Button onClick={register}>Register</Button>
        <Button onClick={login}>Login</Button>
      </div>
    </div>
  );
};

export default CreateProject;
