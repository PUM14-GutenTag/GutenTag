import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

// Form for importing files to a project with projectID.
// Image projects require JSON file and image files, others only require JSON.
const ImportForm = ({ projectID, projectType, className }) => {
  const [textFiles, setTextFiles] = useState();
  const [imageFiles, setImageFiles] = useState();
  const [importEnabled, setImportEnabled] = useState(true);
  const [status, setStatus] = useState(null);

  const textRef = useRef();
  const imageRef = useRef();

  // Reset file elements.
  const resetFiles = () => {
    setTextFiles(null);
    textRef.current.value = '';
    if (projectType === ProjectType.IMAGE_CLASSIFICATION) {
      setImageFiles(null);
      imageRef.current.value = '';
    }
  };

  // Update the interface on the file upload progress.
  // Beware that this is only for the file transfer itself, and does not include server processing.
  const handleUploadProgress = (e) => {
    const percentCompleted = Math.round((e.loaded * 100) / e.total);
    const isDone = percentCompleted >= 100;
    let uploadStatus;
    if (isDone) {
      uploadStatus =
        'Upload complete. Beware that the data may take a while to process before appearing in the project.';
      resetFiles();
    } else {
      uploadStatus = `Uploading: ${percentCompleted}%...`;
    }
    setStatus(uploadStatus);
    setImportEnabled(isDone);
  };

  // Keep HTML consistent with file states.
  useEffect(() => {
    textRef.current.files = textFiles;

    if (projectType === ProjectType.IMAGE_CLASSIFICATION) {
      imageRef.current.files = imageFiles;
      setImportEnabled(textFiles != null && imageFiles != null);
    } else {
      setImportEnabled(textFiles != null);
    }
  }, [textFiles, imageFiles, projectType]);

  // Upload imported files and reset form if successful.
  const handleImport = async () => {
    try {
      if (projectType === ProjectType.IMAGE_CLASSIFICATION)
        await HTTPLauncher.sendAddNewImageData(
          projectID,
          textFiles[0],
          imageFiles,
          handleUploadProgress
        );
      else await HTTPLauncher.sendAddNewTextData(projectID, textFiles[0], handleUploadProgress);
    } catch (e) {
      setStatus(e.toString());
    }
  };

  return (
    <Form className={`center-importform ${className}`}>
      <Row>
        <Form.File
          id="text-upload"
          ref={textRef}
          label="Upload text file (json)"
          accept=".json"
          onChange={(e) => setTextFiles(e.target.files)}
        />
        {projectType === ProjectType.IMAGE_CLASSIFICATION && (
          <Form.File
            id="image-upload"
            ref={imageRef}
            label="Upload image files (jpg, png)"
            accept=".jpg, .jpeg, .png"
            multiple
            onChange={(e) => setImageFiles(e.target.files)}
          />
        )}
      </Row>
      <br />
      <Button className="dark" margin-bottom="1em" disabled={!importEnabled} onClick={handleImport}>
        Submit
      </Button>
      {/* Probably should switch this out for built-in form validation. */}
      <Form.Label>{status}</Form.Label>
    </Form>
  );
};

ImportForm.propTypes = {
  projectID: PropTypes.number.isRequired,
  projectType: PropTypes.number.isRequired,
  className: PropTypes.string,
};

ImportForm.defaultProps = {
  className: '',
};

export default ImportForm;
