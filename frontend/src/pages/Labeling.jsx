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
  const [lastData, setLastData] = useState('');
  const [lastLabel, setLastLabel] = useState('');
  const [projectData, setProjectData] = useState('');
  const [currentData, setCurrentData] = useState();
  const [label, setLabel] = useState('');
  const type = useParams().projectType;

  const projectId = useParams().id;

  async function fetchProjectData() {
    const response = await HTTPLauncher.sendGetData(projectId);
    setProjectData(response.data);
    setCurrentData(Object.keys(response.data)[0]);
  }

  async function testAddProjectData() {
    console.log('Adddddddd data');
    const response = await HTTPLauncher.sendAddNewTextData(
      projectId,
      JSON.stringify([
        {
          text: 'Data nummer 1',
          labels: [],
        },
        {
          text: 'Data nummer 2',
          labels: [],
        },
        {
          text: 'Data nummer 3',
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

    return <div>This data shouldn't be labeled</div>;
  };
  const nextData = () => {
    setLastData(projectData);
    fetchProjectData();
  };

  const getLastData = () => {
    const tempLastData = lastData;
    const tempProjectData = projectData;
    setLastData(tempProjectData);
    setProjectData(tempLastData);
    setCurrentData(Object.keys(tempLastData)[0]);
  };

  const addLabel = async (event) => {
    event.preventDefault();
    // eslint-disable-next-line radix
    const dataId = parseInt(
      Object.keys(projectData).find((key) => projectData[key] === projectData[currentData])
    );
    setLastData(projectData);
    const response = await HTTPLauncher.sendCreateDocumentClassificationLabel(dataId, label);
    fetchProjectData();
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
          <ChevronLeft className="left-align make-large fa-10x arrow-btn" onClick={getLastData} />
          <div className="data-content">{renderAuthButton(type)}</div>
          <ChevronRight className="right-align make-large fa-10x arrow-btn" onClick={nextData} />
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
