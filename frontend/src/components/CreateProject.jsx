import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

const CreateProject = ({ toggleCallback }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(1);
  const [id, setId] = useState();

  const getID = () => {
    console.log(id);
    return id;
  };
  const redirectEdit = () => {
    console.log('REDIRECT');
    return (
      <Redirect
        to={{
          pathname: '/edit-project',
          state: {
            id: getID(),
            name: projectName,
            projectType,
          },
        }}
      />
    );
  };

  useEffect(() => {
    if (id !== null) redirectEdit();
  }, [id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const response = await HTTPLauncher.sendCreateProject(projectName, projectType);
    setId(response.data.id);
    console.log(response);
    // toggleCallback();
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

        <Button className="dark" variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

CreateProject.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default CreateProject;
