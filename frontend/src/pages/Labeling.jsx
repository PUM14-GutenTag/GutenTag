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
  const [dataId, setDataId] = useState();
  const [label, setLabel] = useState('');
  const [currentData, setCurrentData] = useState('');
  const [dataCounter, setDataCounter] = useState(0);
  const projectId = useParams().id;
  const type = useParams().projectType;
  const [listOfDataPoints, setListOfDataPoints] = useState([]);

  async function fetchdata() {
    const response = await HTTPLauncher.sendGetData(projectId, 5);

    /*
    const result = Object.keys(response.data).map((key) => [key, response.data[key]]);
    setListOfDataPoints(result); // here we got all the relevant datapoints
    */
    setListOfDataPoints(response.data);

    changeData(dataCounter);
  }
  function changeData(count) {
    setCurrentData(listOfDataPoints[count]);
    setDataId(Object.keys(listOfDataPoints)[count]);
    setDataCounter(count);
  }

  async function testAdddata() {
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
        {
          text: 'Data nummer 4',
          labels: [],
        },
        {
          text: 'Data nummer 5',
          labels: [],
        },
        {
          text: 'Data nummer 6',
          labels: [],
        },
        {
          text: 'Data nummer 7',
          labels: [],
        },
        {
          text: 'Data nummer 8',
          labels: [],
        },
        {
          text: 'Data nummer 9',
          labels: [],
        },
        {
          text: 'Data nummer 10',
          labels: [],
        },
        {
          text: 'Data nummer 11',
          labels: [],
        },
        {
          text: 'Data nummer 12',
          labels: [],
        },
      ])
    );
    console.log(response);
  }

  useEffect(() => {
    fetchdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderAuthButton = (typeOfProject) => {
    if (listOfDataPoints[dataId]) {
      if (typeOfProject === '1') {
        return <DocumentClassification data={listOfDataPoints[dataId]} />;
      }
    }

    return <div>This data shouldn't be labeled</div>;
  };

  const nextData = () => {
    // change datacounter
    const tempDataCounter = dataCounter + 1;

    if (Object.keys(listOfDataPoints).length - 1 < tempDataCounter) {
      fetchdata();
    } else {
      changeData(tempDataCounter);
    }

    // hur hämtar man ut en label?
  };

  const getLastData = () => {
    if (dataCounter - 1 >= 0) {
      const tempDataCounter = dataCounter - 1;
      changeData(tempDataCounter);
    } else {
      console.log('This is the first data');
    }

    // hur hämtar man ut en label?
  };

  const addLabel = async (event) => {
    event.preventDefault();
    const currentDataPoint = currentData;
    const response = await HTTPLauncher.sendCreateDocumentClassificationLabel(dataId, label);

    const tempDataCounter = dataCounter + 1;
    changeData(tempDataCounter);
  };

  const seeExportData = async () => {
    console.log(listOfDataPoints);
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
        <button type="button" className="btn btn-primary" onClick={testAdddata}>
          Add data
        </button>
      </div>
      <button type="button" className="btn btn-primary" onClick={seeExportData}>
        listOfDataPoints
      </button>
    </div>
  );
};

export default Labeling;
