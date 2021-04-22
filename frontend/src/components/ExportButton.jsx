import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { saveAs } from 'file-saver';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

// Button for exporting files from a project and saving to file system through dialog.
// Image projects are exported as zips with JSON and images, others as JSON files.
const ExportButton = ({ projectID, projectType, fileName }) => {
  const handleExport = async () => {
    const response = await HTTPLauncher.sendGetExportData(projectID);
    const ext = projectType === ProjectType.IMAGE_CLASSIFICATION ? 'zip' : 'json';
    saveAs(new Blob([response.data], { type: `application/${ext}` }), `${fileName}.${ext}`);
  };

  return <Button onClick={handleExport}>Export all data</Button>;
};

ExportButton.propTypes = {
  projectID: PropTypes.number.isRequired,
  projectType: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
};

export default ExportButton;
