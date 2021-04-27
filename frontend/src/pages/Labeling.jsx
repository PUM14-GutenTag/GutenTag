/* eslint-disable radix */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import SequenceToSequence from '../components/SequenceToSequence';
import FinishedPopUp from '../components/FinishedPopUp';
import '../css/Labeling.css';
import Layout from '../components/Layout';
import Label from '../components/Label';

/* 
Labeling-page handles labeling functionality
*/
const Labeling = ({ location }) => {
  const { projectType, id } = location.state;
  const [index, setIndex] = useState();
  const [finished, setFinished] = useState(false);
  const [labels, setLabels] = useState([]);
  const [listOfDataPoints, setListOfDataPoints] = useState([]);
  const [progress, setProgress] = useState(0);

  const type = projectType;
  const projectId = id;
  // fetch all labels for a given datapoint
  const getSetLabels = async (dataPoints = listOfDataPoints, counter = dataCounter) => {
    if (dataPoints[counter]) {
      const response = await HTTPLauncher.sendGetLabel(projectId, dataPoints[counter][0]);
      if (response.data) {
        setLabels(Object.values(response.data));
      } else {
        setLabels([]);
      }
    }
  };

  // Choose size of the text to use depending on the length of the text
  const textBoxSize = () => {
    const data = listOfDataPoints[dataCounter][1];
    if (data.length < 18) {
      return 'small-text';
    }
    if (data.length < 600) {
      return 'medium-text';
    }
    return 'large-text';
  };

  // function which can be called through callbacks to remove label
  const deleteLabel = async (labelId) => {
    await HTTPLauncher.sendRemoveLabel(labelId);
    getSetLabels();
  };

  // Gets 5 new datapoints from database, runs when entering a project
  const fetchData = async () => {
    const response = await HTTPLauncher.sendGetData(projectId);
    console.log(response);

    // check if project has data left to label otherwise get data for label
    if (Object.keys(response.data).length === 0) {
      setFinished(true);
      return;
    }
    // create array of arrays from object with key and value pair
    setListOfDataPoints(response.data.list);
    console.log(response.data.list);
    console.log(response.data.index);
    setIndex(response.data.index);
    // getSetLabels(dataArray, 0);
  };

  const getAmountOfData = async () => {
    const response = await HTTPLauncher.sendGetAmountOfData(projectId);
    console.log('data: ', response);
    const dataAmount = response.data.dataAmount;
    const labeledByUser = response.data.labeledByUser;
    if (dataAmount === 0) {
      setProgress(0);
    } else {
      setProgress((labeledByUser / dataAmount) * 100);
    }
  };
  useEffect(() => {
    getAmountOfData();
  }, [deleteLabel]);

  useEffect(() => {
    fetchData();

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
    let slicedListOfDataPoints = [];
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
        slicedListOfDataPoints = tempListOfDataPoints;
        setListOfDataPoints(tempListOfDataPoints);
      } else {
        newDataCounter = dataCounter + incrementDataPoint;
        setDataCounter(newDataCounter);
      }
    } else {
      setDataCounter(dataCounter + incrementDataPoint);
      newDataCounter = dataCounter + incrementDataPoint;
    }
    getSetLabels(slicedListOfDataPoints, newDataCounter);
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
      if (typeOfProject === 1) {
        return (
          <DocumentClassification
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0], 10)}
            getSetLabels={getSetLabels}
            textBoxSize={textBoxSize()}
          />
        );
      }
      if (typeOfProject === 3) {
        return (
          <SequenceToSequence
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0], 10)}
            getSetLabels={getSetLabels}
            textBoxSize={textBoxSize()}
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
    }
  };

  // temporary help function
  const seelistOfDataPoints = () => {
    console.log(listOfDataPoints);
  };

  // decide for which project types label suggestions should appear
  const suggestionLabels = (typeOfProject) => {
    /* Seq to Seq should not display suggestions */
    if (typeOfProject !== 3) {
      return (
        <>
          <hr className="hr-title" data-content="Suggestions" />
        </>
      );
    }
    return <></>;
  };

  return (
    <Layout>
      <div className="content-container">
        <div className="progress-bars">
          <ProgressBar striped variant="success" now={progress} />
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
            <Button
              className="btn btn-primary"
              as={Link}
              to={{
                pathname: '/home',
              }}
            >
              Go back
            </Button>
            <button type="button" className="btn btn-primary" onClick={seelistOfDataPoints}>
              CurrentDataPoints
            </button>
          </div>
        ) : (
          <FinishedPopUp />
        )}
      </div>
    </Layout>
  );
};

Labeling.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      projectType: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Labeling;
