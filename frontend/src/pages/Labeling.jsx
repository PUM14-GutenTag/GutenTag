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
import Sequence from '../components/Sequence';
import FinishedPopUp from '../components/FinishedPopUp';
import '../css/Labeling.css';
import Layout from '../components/Layout';
import Label from '../components/Label';
import ProjectType from '../ProjectType';
import DefaultLabels from '../components/DefaultLabels';

/*
Labeling-page handles labeling functionality
*/
const Labeling = ({ location }) => {
  const { projectType, id } = location.state;

  const [labels, setLabels] = useState([]);
  const [index, setIndex] = useState(0);
  const [listOfDataPoints, setListOfDataPoints] = useState([]);
  const [progressInvidual, setProgressInvidual] = useState(0);
  const [progressProject, setProgressProject] = useState(0);
  const [dataAmount, setDataAmount] = useState(0);
  const [gettingLast, setGettingLast] = useState(false);
  const [gettingNext, setGettingNext] = useState(false);
  const [defaultLabel, setLabel] = useState('');
  const CURRENT_DATA = 5;

  const getDataTypeEnum = Object.freeze({ whole_list: 0, earlier_value: -1, next_value: 1 });
  const type = projectType;
  const projectId = id;
  // fetch progress
  const fetchProgress = async () => {
    const response = await HTTPLauncher.sendGetProjectProgress(id);
    if (typeof response.status !== 'undefined' && response.status === 200) {
      setProgressProject(response.data.progress);
    }
  };

  // fetch all labels for a given datapoint
  const getSetLabels = async (dataPoints = listOfDataPoints) => {
    if (Object.keys(dataPoints[CURRENT_DATA]).length !== 0) {
      const response = await HTTPLauncher.sendGetLabel(projectId, dataPoints[CURRENT_DATA].id);

      if (typeof response.status !== 'undefined' && response.status === 200) {
        if (Object.keys(response.data.labels).length !== 0) {
          setLabels(Object.values(response.data.labels));
        } else {
          setLabels([]);
        }
        fetchProgress();
      }
    }
  };

  // Function which can be called through callbacks to remove label
  const deleteLabel = async (labelId) => {
    await HTTPLauncher.sendRemoveLabel(labelId);
    getSetLabels();
  };

  // Get a list of new datapoints from database, runs when entering a project
  const fetchData = async () => {
    const response = await HTTPLauncher.sendGetData(projectId, getDataTypeEnum.whole_list);

    if (typeof response.status !== 'undefined' && response.status === 200) {
      setListOfDataPoints(response.data.list);
      setIndex(response.data.index);
      getSetLabels(response.data.list);
    }
  };

  useEffect(() => {
    // Gets amount of data in project and individual progress in percent
    const getAmountOfData = async () => {
      const response = await HTTPLauncher.sendGetAmountOfData(projectId);
      if (typeof response.status !== 'undefined' && response.status === 200) {
        setDataAmount(response.data.dataAmount);
        const labeledByUser = response.data.labeledByUser;
        if (response.data.dataAmount === 0) {
          setProgressInvidual(0);
        } else {
          setProgressInvidual((labeledByUser / response.data.dataAmount) * 100);
        }
      }
    };
    getAmountOfData();
  }, [labels, projectId]);

  useEffect(() => {
    fetchData();
    if (listOfDataPoints.length > 0) {
      getSetLabels(listOfDataPoints);
    }
  }, []);

  // Get earlier datapoint, and delete data point out of scope from list
  const getLastData = async () => {
    const tempLocalIndex = CURRENT_DATA - 1;
    const tempListOfDataPoints = listOfDataPoints.slice();
    if (
      !(Object.keys(listOfDataPoints[tempLocalIndex]).length === 0) &&
      index > 0 &&
      !gettingLast
    ) {
      setGettingLast(true);
      const tempIndex = index - 1;
      setIndex(tempIndex);
      tempListOfDataPoints.pop();
      tempListOfDataPoints.unshift({});
      setListOfDataPoints(tempListOfDataPoints);
      const response = await HTTPLauncher.sendGetData(
        projectId,
        getDataTypeEnum.earlier_value,
        tempIndex
      );

      if (typeof response.status !== 'undefined' && response.status === 200) {
        tempListOfDataPoints.shift();
        tempListOfDataPoints.unshift(response.data);
        setListOfDataPoints(tempListOfDataPoints);
        getSetLabels(tempListOfDataPoints);
        setGettingLast(false);
      }
    }
  };

  // Get next datapoint, and delete data point out of scope from list
  const nextData = async () => {
    const tempLocalIndex = CURRENT_DATA + 1;
    const tempListOfDataPoints = listOfDataPoints.slice();
    if (
      !(Object.keys(listOfDataPoints[tempLocalIndex]).length === 0) &&
      index < dataAmount - 1 &&
      !gettingNext
    ) {
      setGettingNext(true);
      const tempIndex = index + 1;
      setIndex(tempIndex);
      tempListOfDataPoints.shift();
      setListOfDataPoints(tempListOfDataPoints);
      const response = await HTTPLauncher.sendGetData(
        projectId,
        getDataTypeEnum.next_value,
        tempIndex
      );

      if (typeof response.status !== 'undefined' && response.status === 200) {
        tempListOfDataPoints.push(response.data);
        setListOfDataPoints(tempListOfDataPoints);
        getSetLabels(tempListOfDataPoints);
        setGettingNext(false);
      }
    }
  };

  const handleUserKeyPress = (e) => {
    const { key } = e;
    if (key === 'ArrowRight') {
      nextData();
    } else if (key === 'ArrowLeft') {
      getLastData();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [listOfDataPoints, gettingNext, gettingLast, index]);

  // select what project type showed be displayed bases on project type
  const selectProjectComponent = (typeOfProject) => {
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
            labels={labels}
            defaultLabel={defaultLabel}
            setLabel={setLabel}
          />
        );
      }
      if (typeOfProject === ProjectType.SEQUENCE_LABELING) {
        return (
          <Sequence
            data={listOfDataPoints[CURRENT_DATA].data}
            getSetLabels={getSetLabels}
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            labels={labels}
            defaultLabel={defaultLabel}
            setLabel={setLabel}
          />
        );
      }
      if (typeOfProject === ProjectType.IMAGE_CLASSIFICATION) {
        return (
          <ImageLabeling
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            getSetLabels={getSetLabels}
            labels={labels}
            defaultLabel={defaultLabel}
            setLabel={setLabel}
          />
        );
      }
      if (typeOfProject === ProjectType.SEQUENCE_TO_SEQUENCE) {
        return (
          <SequenceToSequence
            data={listOfDataPoints[CURRENT_DATA].data}
            dataPointId={parseInt(listOfDataPoints[CURRENT_DATA].id, 10)}
            getSetLabels={getSetLabels}
            labels={labels}
          />
        );
      }
    }

    return <></>;
  };

  // Choose for which project types label suggestions should appear
  const suggestionLabels = (typeOfProject) => {
    // Seq to Seq should not display suggestions
    if (typeOfProject !== ProjectType.SEQUENCE_TO_SEQUENCE) {
      return (
        <div>
          <hr className="hr-title" data-content="Suggestions" />
          <DefaultLabels projectID={projectId} setLabel={setLabel} />
        </div>
      );
    }
    return <></>;
  };
  const finishedLabel = () => {
    if (progressInvidual === 100 && progressProject !== 100) {
      return <FinishedPopUp projectDone={false} />;
    }
    if (progressProject === 100) {
      return <FinishedPopUp projectDone />;
    }
    return (
      <div>
        <div style={{ color: 'black', opacity: '0.5', paddingLeft: '0.2em' }}>
          Individual progression
        </div>
        <ProgressBar
          variant="sec"
          now={progressInvidual}
          label={`${progressInvidual.toFixed(2)}%`}
        />
      </div>
    );
  };

  return (
    <Layout>
      <Button
        className="dark"
        as={Link}
        to={{
          pathname: '/home',
        }}
      >
        Back
      </Button>
      <div className="content-container">
        <div className="progress-bars">
          {finishedLabel()}
          <br />
          <div style={{ color: 'black', opacity: '0.5', paddingLeft: '0.2em' }}>
            Project progression
          </div>
          <ProgressBar
            variant="prim"
            now={progressProject}
            label={`${progressProject.toFixed(2)}%`}
          />
        </div>
        <br />
        <div>
          <div className="main-content">
            <ChevronLeft
              className="right-left-arrow  make-large fa-7x arrow-btn"
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
                      color={oneLabel.color}
                    />
                  </div>
                ))}
              </div>
            </div>

            <ChevronRight
              className="right-left-arrow  make-large fa-7x arrow-btn"
              onClick={nextData}
            />
          </div>
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
