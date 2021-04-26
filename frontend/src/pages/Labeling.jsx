/* eslint-disable radix */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import SequenceToSequence from '../components/SequenceToSequence';
import FinishedPopUp from '../components/FinishedPopUp';
import '../css/Labeling.css';
import Label from '../components/Label';

/* 
Labeling-page handles labeling functionality
*/
const Labeling = () => {
  const [dataCounter, setDataCounter] = useState(0);
  const [finished, setFinished] = useState(false);
  const [labels, setLabels] = useState([]);

  const projectId = useParams().id;
  const type = useParams().projectType;
  const [listOfDataPoints, setListOfDataPoints] = useState([]);

  // fetch all labels for a given datapoint
  async function getSetLabels(dataPoints = listOfDataPoints, tempDataCounter = dataCounter) {
    if (typeof dataPoints[tempDataCounter] !== 'undefined') {
      const response = await HTTPLauncher.sendGetLabel(projectId, dataPoints[tempDataCounter][0]);
      if (response.data != null) {
        setLabels(Object.values(response.data));
      } else {
        setLabels([]);
      }
    }
  }

  // function which can be called through callbacks to remove label
  const deleteLabel = async (labelId) => {
    await HTTPLauncher.sendRemoveLabel(labelId);
    getSetLabels();
  };

  // Gets 5 new datapoints from database, runs when entering a project
  async function fetchdata() {
    const response = await HTTPLauncher.sendGetData(projectId, 5);

    // check if project has data left to label otherwise get data for label
    if (Object.keys(response.data).length === 0) {
      setFinished(true);
      return;
    }
    // create array of arrays from object with key and value pair
    const dataArray = Object.entries(response.data);
    setListOfDataPoints(dataArray);
    setDataCounter(0);
    getSetLabels(dataArray, 0);
  }

  // Temporary function to add testdata to projects
  async function testAddData() {
    await HTTPLauncher.sendAddNewTextData(
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
      ])
    );
  }

  useEffect(() => {
    fetchdata();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (listOfDataPoints.length > 0) {
      getSetLabels(listOfDataPoints, dataCounter);
    }
    // eslint-disable-next-line
  }, [dataCounter]);

  const dataCounterLogic = async (incrementDataPoint, newListOfDataPoints = listOfDataPoints) => {
    /* 
    Remove other duplicate data points from data points list if data point has been labled
    */
    const currentDataPoint = newListOfDataPoints[dataCounter];
    let dataPointExists = false;
    const removeIndexList = [];
    let counterAdjust = 0;
    let newDataCounter = 0;
    // iterate list of data points with higher index than current data point
    // and check if there exist data points with the same data
    for (let i = 0; i < newListOfDataPoints.length; i++) {
      // skip current data point
      if (
        JSON.stringify(currentDataPoint) === JSON.stringify(newListOfDataPoints[i]) &&
        i !== dataCounter
      ) {
        dataPointExists = true;
        removeIndexList.push(i); // list of all index in the future which has to be removed

        // if index less then current data point then add tp counter adjustment
        if (i < dataCounter) {
          counterAdjust += 1;
        }
      }
    }
    if (dataPointExists) {
      const response = await HTTPLauncher.sendGetLabel(projectId, currentDataPoint[0]);
      // check if current data point has been labeled
      if (response.data != null) {
        newDataCounter = dataCounter - counterAdjust + incrementDataPoint;
        setDataCounter(newDataCounter);

        // create copy of list of data points
        const tempListOfDataPoints = newListOfDataPoints.slice();
        removeIndexList.reverse();
        for (let i = 0; i < removeIndexList.length; i++) {
          tempListOfDataPoints.splice(removeIndexList[i], 1);
        }
        newListOfDataPoints = tempListOfDataPoints;
        setListOfDataPoints(tempListOfDataPoints);
      } else {
        newDataCounter = dataCounter + incrementDataPoint;
        setDataCounter(newDataCounter);
      }
    } else {
      setDataCounter(dataCounter + incrementDataPoint);
      newDataCounter = dataCounter + incrementDataPoint;
    }
    getSetLabels(newListOfDataPoints, newDataCounter);
  };

  // Go to next datapoint, and get a new one
  const nextData = async () => {
    const tempDataCounter = dataCounter + 1;
    let newListOfDataPoints = listOfDataPoints;
    // If there are less than 5 datapoints ahead in the list
    if (Object.keys(listOfDataPoints).length - 5 < tempDataCounter) {
      // adjust so there is always 5 datapoints ahead in the queue
      const diff = Object.keys(listOfDataPoints).length - tempDataCounter;
      const addToQueue = 5 - diff;
      const response = await HTTPLauncher.sendGetData(projectId, addToQueue);

      // check if labeling is done
      if (Object.keys(response.data).length === 0) {
        setFinished(true);
      } else {
        // add new data to list of data points
        const newDataPoint = Object.entries(response.data);
        const tempListOfDataPoints = listOfDataPoints.slice();
        newListOfDataPoints = tempListOfDataPoints.concat(newDataPoint);
        setListOfDataPoints(newListOfDataPoints);
      }
    }
    dataCounterLogic(1, newListOfDataPoints);
  };

  // select what project type showed be displayed bases on project type
  const selectProjectComponent = (typeOfProject) => {
    if (listOfDataPoints[dataCounter]) {
      if (typeOfProject === '1') {
        return (
          <DocumentClassification
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0])}
            getSetLabels={getSetLabels}
          />
        );
      }
      if (typeOfProject === '3') {
        return (
          <SequenceToSequence
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0])}
            getSetLabels={getSetLabels}
          />
        );
      }
    }

    return <div>This should not show</div>;
  };

  // Go to the data before in listOfDataPoints (last shown data)
  const getLastData = () => {
    if (dataCounter - 1 >= 0) {
      dataCounterLogic(-1, listOfDataPoints);
    } else {
      console.log('This is the first data');
    }
  };

  // temporary help function
  const seelistOfDataPoints = () => {
    console.log(listOfDataPoints);
  };

  // temporary help function
  const seeExportData = async () => {
    const response = await HTTPLauncher.sendGetExportData(projectId);
    console.log(response);
  };

  // decide for which project types label suggestions should appear
  const suggestionLabels = (typeOfProject) => {
    /* Seq to Seq should not display suggestions */
    if (typeOfProject !== '3') {
      return (
        <>
          {' '}
          <hr className="hr-title" data-content="Suggestions" />
          <h6> [Insert suggestions from admin]</h6>{' '}
        </>
      );
    }
  };

  return (
    <div className="content-container">
      <div className="progress-bars">
        <ProgressBar striped variant="success" now={75} />
        <br />
        <ProgressBar striped variant="warning" now={25} />
      </div>
      <br />
      {!finished ? (
        <div>
          <div className="main-content">
            <ChevronLeft
              className="right-left-arrow  make-large fa-10x arrow-btn"
              onClick={getLastData}
            />

            <div className="data-content">
              {suggestionLabels(type)}

              {/* Project type component */}
              {selectProjectComponent(type)}

              <hr className="hr-title" data-content="Your Labels" />
              <div className="your-labels-container">
                {labels.map((oneLabel) => (
                  <div key={oneLabel.label_id}>
                    <Label
                      labelId={oneLabel.label_id}
                      label={oneLabel.label}
                      deleteLabel={deleteLabel}
                    />
                  </div>
                ))}
              </div>
            </div>

            <ChevronRight
              className="right-left-arrow  make-large fa-10x arrow-btn"
              onClick={nextData}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.location.href = 'http://localhost:3000/home';
            }}
          >
            Go back
          </button>
          <button type="button" className="btn btn-primary" onClick={seelistOfDataPoints}>
            CurrentDataPoints
          </button>
          <button type="button" className="btn btn-primary" onClick={seeExportData}>
            See exported data
          </button>
        </div>
      ) : (
        <FinishedPopUp />
      )}

      <button type="button" className="btn btn-primary" onClick={testAddData}>
        Add data
      </button>
    </div>
  );
};

export default Labeling;
