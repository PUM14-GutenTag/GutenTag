import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import ImageLabeling from '../components/ImageLabeling';
import SequenceToSequence from '../components/SequenceToSequence';
import FinishedPopUp from '../components/FinishedPopUp';
import '../css/Labeling.css';
import Layout from '../components/Layout';
import Label from '../components/Label';
import ProjectType from '../ProjectType';

/* 
Labeling-page handles labeling functionality
*/
const Labeling = ({ location }) => {
  const CURRENT_DATA = 5;
  const { projectType, id } = location.state;

  const [labels, setLabels] = useState([]);
  const [index, setIndex] = useState(0);
  const [listOfDataPoints, setListOfDataPoints] = useState([]);
  const [progress, setProgress] = useState(0);
  const [dataAmount, setDataAmount] = useState(0);

  const getDataTypeEnum = Object.freeze({ whole_list: 0, earlier_value: -1, next_value: 1 });
  const type = projectType;
  const projectId = id;
  // fetch all labels for a given datapoint
  const getSetLabels = async (dataPoints = listOfDataPoints) => {
    if (Object.keys(dataPoints[CURRENT_DATA]).length !== 0) {
      const response = await HTTPLauncher.sendGetLabel(projectId, dataPoints[CURRENT_DATA].id);
      if (Object.keys(response.data.labels).length !== 0) {
        setLabels(Object.values(response.data.labels));
      } else {
        setLabels([]);
      }
    }
  };

  // Choose size of the text to use depending on the length of the text
  const textBoxSize = () => {
    const data = listOfDataPoints[CURRENT_DATA].data;
    if (data.length < 18) {
      return 'small-text';
    }
    if (data.length < 600) {
      return 'medium-text';
    }
    return 'large-text';
  };

  // Function which can be called through callbacks to remove label
  const deleteLabel = async (labelId) => {
    await HTTPLauncher.sendRemoveLabel(labelId);
    getSetLabels();
  };

  // Get a list of new datapoints from database, runs when entering a project
  const fetchData = async () => {
    const response = await HTTPLauncher.sendGetData(projectId, getDataTypeEnum.whole_list);

    setListOfDataPoints(response.data.list);
    setIndex(response.data.index);
    getSetLabels(response.data.list);
  };

  useEffect(() => {
    // Gets amount of data in project and individual progress in percent
    const getAmountOfData = async () => {
      const response = await HTTPLauncher.sendGetAmountOfData(projectId);
      setDataAmount(response.data.dataAmount);
      const labeledByUser = response.data.labeledByUser;
      if (response.data.dataAmount === 0) {
        setProgress(0);
      } else {
        setProgress((labeledByUser / response.data.dataAmount) * 100);
      }
    };

    getAmountOfData();
  }, [labels, projectId]);

  useEffect(() => {
    fetchData();
    if (listOfDataPoints.length > 0) {
      getSetLabels(listOfDataPoints);
    }

    // eslint-disable-next-line
  }, []);

  // Get earlier datapoint, and delete data point out of scope from list
  const getLastData = async () => {
    const tempLocalIndex = CURRENT_DATA - 1;
    const tempListOfDataPoints = listOfDataPoints.slice();
    if (!(Object.keys(listOfDataPoints[tempLocalIndex]).length === 0)) {
      const tempIndex = index - 1;
      setIndex(tempIndex);
      tempListOfDataPoints.pop();
      const response = await HTTPLauncher.sendGetData(
        projectId,
        getDataTypeEnum.earlier_value,
        tempIndex
      );
      tempListOfDataPoints.unshift(response.data);
      setListOfDataPoints(tempListOfDataPoints);
      getSetLabels(tempListOfDataPoints);
    }
  };

  // Get next datapoint, and delete data point out of scope from list
  const nextData = async () => {
    const tempLocalIndex = CURRENT_DATA + 1;
    const tempListOfDataPoints = listOfDataPoints.slice();
    if (!(Object.keys(listOfDataPoints[tempLocalIndex]).length === 0)) {
      const tempIndex = index + 1;
      setIndex(tempIndex);
      tempListOfDataPoints.shift();
      const response = await HTTPLauncher.sendGetData(
        projectId,
        getDataTypeEnum.next_value,
        tempIndex
      );
      tempListOfDataPoints.push(response.data);
      setListOfDataPoints(tempListOfDataPoints);
      getSetLabels(tempListOfDataPoints);
    }
  };

  // select what project type showed be displayed bases on project type
  const selectProjectComponent = (typeOfProject) => {
    // {}
    if (
      listOfDataPoints.length > 0 &&
      listOfDataPoints[CURRENT_DATA] &&
      Object.keys(listOfDataPoints[CURRENT_DATA]).length !== 0
    ) {
      if (typeOfProject === ProjectType.DOCUMENT_CLASSIFICATION) {
        return (
          <DocumentClassification
            data={listOfDataPoints[CURRENT_DATA].data}
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            getSetLabels={getSetLabels}
            textBoxSize={textBoxSize()}
          />
        );
      }
      if (typeOfProject === ProjectType.IMAGE_CLASSIFICATION) {
        return (
          <ImageLabeling
            // data={listOfDataPoints[CURRENT_DATA].data}
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            getSetLabels={getSetLabels}
          />
        );
      }
      if (typeOfProject === ProjectType.SEQUENCE_LABELING) {
        return (
          <SequenceToSequence
            data={listOfDataPoints[CURRENT_DATA].data}
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            getSetLabels={getSetLabels}
            textBoxSize={textBoxSize()}
          />
        );
      }
    }
    return <></>;
  };

  const suggestionLabels = (typeOfProject) => {
    /* Choose for which project types label suggestions should appear */
    // Seq to Seq should not display suggestions
    if (typeOfProject !== ProjectType.SEQUENCE_TO_SEQUENCE) {
      return <hr className="hr-title" data-content="Suggestions" />;
    }
    return <></>;
  };
  const finishedLabel = () => {
    if (progress === 100) {
      return <FinishedPopUp />;
    }
    return <ProgressBar striped variant="success" now={progress} />;
  };

  return (
    <Layout>
      <div className="content-container">
        <div className="progress-bars">
          {finishedLabel()}
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

            <div className="data-content">
              {suggestionLabels(type)}
              <div>
                {index + 1}/{dataAmount}
              </div>

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
        </div>
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
