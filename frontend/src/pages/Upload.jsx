import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HTTPLauncher from '../services/HTTPLauncher';

const Upload = () => {
  const [projectID, setProjectID] = useState();
  const [textFile, setTextFile] = useState();
  const [imageFiles, setImageFiles] = useState();

  const createProject = async () => {
    const response = await HTTPLauncher.sendCreateProject(`Project type ${1}`, 1);
    if (response.data.id != null) setProjectID(response.data.id);
  };

  const handleSubmit = async () => {
    // HTTPLauncher.sendAddNewTextData(projectID);
    console.log(textFile);
  };

  const handleTextChange = (e) => {
    // console.log(e.target.files);
    const file = e.target.files[0];
    setTextFile(file);
  };

  return (
    <div>
      <h1>Upload</h1>
      <Form style={{ marginLeft: 10 }}>
        <Form.Row>
          <Button onClick={() => HTTPLauncher.sendResetDatabase()}>Reset DB</Button>
        </Form.Row>

        <Form.Row>
          <Button onClick={createProject}>Create Document Project</Button>
        </Form.Row>
        <Form.Row>
          <Form.File
            id="text-upload"
            label={`Upload text file to project #${projectID}`}
            // accept=".jpg, .jpeg, .png"
            // multiple
            accept=".json"
            onChange={handleTextChange}
          />
        </Form.Row>
        <Form.Row>
          <Button onClick={handleSubmit}>Submit</Button>
        </Form.Row>
      </Form>
    </div>
  );
};

export default Upload;
