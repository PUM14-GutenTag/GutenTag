import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Col, Row } from 'react-bootstrap';

import Layout from '../components/Layout';
import ImportForm from '../components/ImportForm';
import InputSpinner from '../components/InputSpinner';
import ExportButton from '../components/ExportButton';
import ManageProjectUsers from '../components/ManageProjectUsers';
import '../css/editProject.css';
import HTTPLauncher from '../services/HTTPLauncher';

/*
 * Page for editing project settings, adding members and importing/exporting
 * files.
 */
const EditProject = ({ location }) => {
  const { id, name, projectType, labelsPerDatapoint } = location.state;

  const sendChange = async (amount) => {
    await HTTPLauncher.sendChangeLabelsPerDatapoint(id, amount);
  };

  const getProjectType = (type) => {
    let result = '';
    switch (type) {
      case 1:
        result = 'Document classification';
        break;
      case 2:
        result = 'Sequence labeling';
        break;
      case 3:
        result = 'Sequence to sequence labeling';
        break;
      case 4:
        result = 'Image classification';
        break;
      default:
        result = 'No project type';
        break;
    }
    return result;
  };

  return (
    <Layout title="Edit project">
      <h1>Project Name: {name}</h1>
      <h2>Project Type: {getProjectType(projectType)}</h2>
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
      <Row className="row-left">
        <div>
          <h1>Labels per datapoint</h1>
          <InputSpinner amount={labelsPerDatapoint} setAmount={sendChange} />
        </div>
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
      labelsPerDatapoint: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default EditProject;
