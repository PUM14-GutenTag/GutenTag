import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { saveAs } from 'file-saver';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

// Button for exporting files from a project and saving to file system through dialog.
// Image projects are exported as zips with JSON and images, others as JSON files.
const ExportButton = ({ projectID, projectType, fileName, className }) => {
  const [exportEnabled, setExportEnabled] = useState(true);
  const [status, setStatus] = useState(null);

  const handleDownloadProgress = (e) => {
    const percentCompleted = Math.round((e.loaded * 100) / e.total);
    const isDone = percentCompleted >= 100;
    let downloadStatus;
    if (!isDone) downloadStatus = `: ${percentCompleted}%...`;
    setStatus(downloadStatus);
    setExportEnabled(isDone);
  };

  const handleExport = async () => {
    setStatus('Preparing download. This may take a while...');
    setExportEnabled(false);
    const response = await HTTPLauncher.sendGetExportData(projectID, handleDownloadProgress);
    const ext = projectType === ProjectType.IMAGE_CLASSIFICATION ? 'zip' : 'json';
    saveAs(new Blob([response.data], { type: `application/${ext}` }), `${fileName}.${ext}`);
  };

  return (
    <div className={className}>
      <Button disabled={!exportEnabled} onClick={handleExport}>
        Export all data
      </Button>
      <span>{status}</span>
    </div>
  );
};

ExportButton.propTypes = {
  projectID: PropTypes.number.isRequired,
  projectType: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ExportButton.defaultProps = {
  className: '',
};

export default ExportButton;
