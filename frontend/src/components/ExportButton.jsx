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

  // Update the interface on the file download progress.
  // Beware that this is only for the file transfer itself, and does not include server processing.
  const handleDownloadProgress = (e) => {
    const percentCompleted = Math.round((e.loaded * 100) / e.total);
    const isDone = percentCompleted >= 100;
    let downloadStatus;
    if (!isDone) downloadStatus = `Downloading: ${percentCompleted}%...`;
    setStatus(downloadStatus);
    setExportEnabled(isDone);
  };

  // Handle an export by opening a file save dialog.
  const handleExport = async () => {
    setStatus('Preparing download. This may take a while...');
    setExportEnabled(false);
    const response = await HTTPLauncher.sendGetExportData(projectID, handleDownloadProgress);
    if (typeof response.status !== 'undefined' && response.status === 200) {
      const ext = projectType === ProjectType.IMAGE_CLASSIFICATION ? 'zip' : 'json';
      saveAs(new Blob([response.data], { type: `application/${ext}` }), `${fileName}.${ext}`);
    }
  };

  return (
    <>
      <Button className={`dark ${className}`} disabled={!exportEnabled} onClick={handleExport}>
        Export all data
      </Button>
      <span>{status}</span>
    </>
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
