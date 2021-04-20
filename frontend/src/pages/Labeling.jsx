import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import '../css/Labeling.css';

const Labeling = () => {
  const [dataCounter, setDataCounter] = useState(0);
  const projectId = useParams().id;
  const type = useParams().projectType;
  const [listOfDataPoints, setListOfDataPoints] = useState([]);

  async function fetchdata() {
    console.log(projectId);
    const response = await HTTPLauncher.sendGetData(1, 5);

    // create Array of arrays from object with key and value pair
    const dataArray = Object.entries(response.data);
    setListOfDataPoints(dataArray);
    changeData(dataCounter);
  }

  function changeData(count) {
    setDataCounter(count);
  }

  async function testAddData() {
    const response = await HTTPLauncher.sendAddNewTextData(
      1,
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

  const selectProjectComponent = (typeOfProject) => {
    if (listOfDataPoints[dataCounter]) {
      if (typeOfProject === '1') {
        return (
          <DocumentClassification
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0])}
            nextData={nextData}
          />
        );
      }
    }

    return <div>This data shouldn't be labeled</div>;
  };

  const nextData = async () => {
    // change datacounter
    const tempDataCounter = dataCounter + 1;

    /* 
      If there are less than 5 datapoints ahead in the list get a new one.
    */
    if (Object.keys(listOfDataPoints).length - 5 < tempDataCounter) {
      const response = await HTTPLauncher.sendGetData(projectId, 1);
      const newDataPoint = Object.entries(response.data);
      const tempListOfDataPoints = listOfDataPoints.slice();

      const newListOfDataPoints = tempListOfDataPoints.concat(newDataPoint);
      setListOfDataPoints(newListOfDataPoints);
      changeData(tempDataCounter);
    } else {
      changeData(tempDataCounter);
    }

  };

  const getLastData = async () => {
    if (dataCounter - 1 >= 0) {
      const tempDataCounter = dataCounter - 1;
      changeData(tempDataCounter);
      console.log("Going back!")
      console.log("This is the data that we are displaying: ", listOfDataPoints[tempDataCounter])
      console.log("Data ID", listOfDataPoints[tempDataCounter][0])
      console.log("Project ID: ", projectId)
      const response = await HTTPLauncher.sendGetLabel(projectId, listOfDataPoints[tempDataCounter][0]);
      console.log("REPSONSE: ", response)
    } else {
      console.log('This is the first data');
    }

    // hur hämtar man ut en label?
  };

  const seelistOfDataPoints = () => {
    console.log(listOfDataPoints);
  };
  


  const seeExportData = async () => {
    const response = await HTTPLauncher.sendGetExportData(projectId);
    console.log(response)
  };

  return (
    <div className="content-container">
      <div className="progress-bars">
        <ProgressBar striped variant="success" now={75} />
        <br />
        <ProgressBar striped variant="warning" now={25} />
      </div>
      <br />
      <div>
        <div className="main-content">
          <ChevronLeft
            className="right-left-arrow  make-large fa-10x arrow-btn"
            onClick={getLastData}
          />

          <div className="data-content">{selectProjectComponent(type)}</div>

          <ChevronRight
            className="right-left-arrow  make-large fa-10x arrow-btn"
            onClick={nextData}
          />
        </div>
      </div>
      {/* <button type="button" className="btn btn-primary" onClick={testAddData}>
          Add data
        </button>
      <button type="button" className="btn btn-primary" onClick={seelistOfDataPoints}>
        CurrentDataPoints
      </button>
      <button type="button" className="btn btn-primary" onClick={seeExportData}>
        See exported data
      </button> */}
    </div>
  );
};

export default Labeling;
