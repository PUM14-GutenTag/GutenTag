import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ImportForm from '../components/ImportForm';
import ExportButton from '../components/ExportButton';

/*
 * Page for editing project settings, adding members and importing/exporting
 * files.
 */
const EditProject = ({ location }) => {
  const { id, name, projectType } = location.state;

  return (
    <div>
      <h1>{name}</h1>
      <Row>
        <Col>
          <h2>Import</h2>
          <ImportForm projectID={id} projectType={projectType} />
        </Col>
        <Col>
          <h2>Export</h2>
          <ExportButton projectID={id} projectType={projectType} fileName={name} />
        </Col>
      </Row>
    </div>
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
