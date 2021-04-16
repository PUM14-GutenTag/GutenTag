import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { saveAs } from 'file-saver';

import HTTPLauncher from '../services/HTTPLauncher';
import ProjectType from '../ProjectType';

/*
 * Page for editing project settings, adding members and importing/exporting
 * files.
 */
const EditProject = ({ location }) => {
  const [textFile, setTextFile] = useState();
  const [imageFiles, setImageFiles] = useState();

  const { id, name, projectType } = location.state;

  const handleImport = async () => {
    // console.log(textFile);
    // console.log([imageFiles]);
    let response;
    if (projectType === ProjectType.IMAGE_CLASSIFICATION)
      response = await HTTPLauncher.sendAddNewImageData(id, textFile, imageFiles);
    else response = await HTTPLauncher.sendAddNewTextData(id, textFile);
    console.log(response);
  };

  const handleExport = async () => {
    const response = await HTTPLauncher.sendGetExportData(id);
    const ext = projectType === ProjectType.IMAGE_CLASSIFICATION ? 'zip' : 'json';
    saveAs(new Blob([response.data], { type: `application/${ext}` }), `${name}.${ext}`);
    console.log(response);
  };

  const handleTextChange = (e) => {
    const file = e.target.files[0];
    setTextFile(file);
  };

  const handleImageChange = (e) => {
    setImageFiles(e.target.files);
  };

  return (
    <div>
      <h1>{name}</h1>
      <Row>
        <Col>
          <h2>Import</h2>
          <Form>
            {/* <Form.Row>
          <Button onClick={() => HTTPLauncher.sendResetDatabase()}>Reset DB</Button>
        </Form.Row> */}
            <Form.Row>
              <Form.File
                id="text-upload"
                label="Upload text file (json)."
                accept=".json"
                onChange={handleTextChange}
              />
              {projectType === ProjectType.IMAGE_CLASSIFICATION && (
                <Form.File
                  id="image-upload"
                  label="Upload image file (jpg, png)"
                  accept=".jpg, .jpeg, .png"
                  multiple
                  onChange={handleImageChange}
                />
              )}
            </Form.Row>
            <Form.Row>
              <Button onClick={handleImport}>Submit</Button>
            </Form.Row>
          </Form>
        </Col>
        <Col>
          <h2>Export</h2>
          <Button onClick={handleExport}>Export all data</Button>
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
