import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import '../css/Labeling.css';

const Labeling = () => {
  const [projectData, setProjectData] = useState('');
  const [currentData, setCurrentData] = useState(1);
  const [label, setLabel] = useState('');
  const type = useParams().projectType;

  const projectId = useParams().id;

  async function fetchProjectData() {
    // const result = await HTTPLauncher.sendGetUserProjects();
    // const data = Object.values(result.data.projects.)
    const response = await HTTPLauncher.sendGetData(projectId, 3);
    // setDataId(Object.keys(response).find((key) => response[key] === response.data[currentData]));
    setProjectData(response.data);
  }

  async function testAddProjectData() {
    console.log('Adddddddd data');
    const response = await HTTPLauncher.sendAddNewTextData(
      projectId,
      JSON.stringify([
        {
          text: 'Baby Yoda',
          labels: [],
        },
      ])
    );
    console.log(response);
  }

  useEffect(() => {
    fetchProjectData();
  }, []);

  /*
  fixa css
  fixa hämta ny data när det är nödvändigt
  fixa labeling
 */

  const renderAuthButton = (typeOfProject) => {
    if (projectData[currentData]) {
      if (typeOfProject === '1') {
        return <DocumentClassification data={projectData[currentData]} />;
      }
    }

    return <div>hej</div>;
  };
  const changeData = (diff) => {
    setCurrentData(currentData + diff);
  };

  const addLabel = async (event) => {
    event.preventDefault();
    // eslint-disable-next-line radix
    const dataId = parseInt(
      Object.keys(projectData).find((key) => projectData[key] === projectData[currentData])
    );
    const response = await HTTPLauncher.sendCreateDocumentClassificationLabel(dataId, label);
    console.log(response);
  };

  return (
    <div className="content-container">
      <div className="progress-bars">
        <ProgressBar striped variant="success" now={40} />
        <br />
        <ProgressBar striped variant="warning" now={80} />
      </div>
      <br />
      <div>
        <div className="main-content">
          <ChevronLeft
            className="left-align make-large fa-10x arrow-btn"
            onClick={() => changeData(-1)}
          />
          <div className="data-content">{renderAuthButton(type)}</div>
          <ChevronRight
            className="right-align make-large fa-10x arrow-btn"
            onClick={() => changeData(1)}
          />
        </div>
        <br />
        <Form onSubmit={addLabel}>
          <Form.Group controlId="form.name">
            <Form.Control
              type="text"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Enter label..."
              required
            />
          </Form.Group>
          <Button className="submitButton" variant="primary" type="submit">
            Label
          </Button>
        </Form>

        <br />
        <button type="button" className="btn btn-primary" onClick={testAddProjectData}>
          Add data
        </button>
      </div>
    </div>
  );
};

export default Labeling;
