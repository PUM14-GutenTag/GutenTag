import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import Layout from '../components/Layout';
import ImportForm from '../components/ImportForm';
import ExportButton from '../components/ExportButton';
import ManageProjectUsers from '../components/ManageProjectUsers';

import '../css/editProject.css';

/*
 * Page for editing project settings, adding members and importing/exporting
 * files.
 */
const EditProject = ({ location }) => {
  const { id, name, projectType } = location.state;

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
