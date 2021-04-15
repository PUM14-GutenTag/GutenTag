import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HTTPLauncher from '../services/HTTPLauncher';

const Upload = () => {
  const [projectID, setProjectID] = useState();
  const [textFile, setTextFile] = useState();
  const [imageFiles, setImageFiles] = useState();

  const createProject = async () => {
    const response = await HTTPLauncher.sendCreateProject(`Project type ${4}`, 4);
    if (response.data.id != null) setProjectID(response.data.id);
  };

  const handleSubmit = async () => {
    // console.log(textFile);
    // console.log([imageFiles]);
    const response = await HTTPLauncher.sendAddNewImageData(projectID, textFile, imageFiles);
    console.log(response);
  };

  const handleTextChange = (e) => {
    // console.log(e.target.files);
    const file = e.target.files[0];
    setTextFile(file);
  };

  const handleImageChange = (e) => {
    // console.log(e.target.files);
    // const file = e.target.files[0];
    setImageFiles(e.target.files);
  };

  return (
    <div>
      <h1>Upload</h1>
      <Form>
        <Form.Row>
          <Button onClick={() => HTTPLauncher.sendResetDatabase()}>Reset DB</Button>
        </Form.Row>

        <Form.Row>
          <Button onClick={createProject}>Create Image Project</Button>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.File
              id="text-upload"
              label={`Upload text file to project #${projectID}`}
              accept=".json"
              onChange={handleTextChange}
            />

            <Form.File
              id="image-upload"
              label={`Upload image file to project #${projectID}`}
              accept=".jpg, .jpeg, .png"
              multiple
              onChange={handleImageChange}
            />
          </Col>
        </Form.Row>
        <Form.Row>
          <Button onClick={handleSubmit}>Submit</Button>
        </Form.Row>
      </Form>
    </div>
  );
};

export default Upload;
