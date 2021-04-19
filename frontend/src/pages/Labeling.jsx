import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import '../css/Labeling.css';

const Labeling = () => {
  const [label, setLabel] = useState('');
  // const [currentData, setCurrentData] = useState('');
  const [dataCounter, setDataCounter] = useState(0);
  const projectId = useParams().id;
  const type = useParams().projectType;
  const [listOfDataPoints, setListOfDataPoints] = useState([]);

  async function fetchdata() {
    const response = await HTTPLauncher.sendGetData(projectId, 5);

    // create Array of arrays from object with key and value pair
    const dataArray = Object.entries(response.data);
    setListOfDataPoints(dataArray);

    /*
      TODO:
      Hämta label när man går tillbaka
      Inte spara för mycket info bakåt, dvs. bara spara 
      Fixa css med mer komponent specifikt UI
    */

    /*
      project id,
      datapoint id
      vill kunna använda ett user id (är det email) 
      också på något sätt för att hämta ut våra specifika labels för datapointen
      */

    changeData(dataCounter);
  }
  function changeData(count) {
    setDataCounter(count);
  }

  async function testAddData() {
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
    console.log('Before if: ', listOfDataPoints);

    /* 
      If there are less than 5 datapoints ahead in the list get a new one.
    */
    if (Object.keys(listOfDataPoints).length - 5 < tempDataCounter) {
      const response = await HTTPLauncher.sendGetData(projectId, 1);
      const newDataPoint = Object.entries(response.data);
      const tempListOfDataPoints = listOfDataPoints.slice();

      const newListOfDataPoints = tempListOfDataPoints.concat(newDataPoint);
      console.log('Final After', newListOfDataPoints);
      setListOfDataPoints(newListOfDataPoints);
      changeData(tempDataCounter);
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
          <ChevronLeft
            className="left-align-arrow make-large fa-10x arrow-btn"
            onClick={getLastData}
          />

          <div className="data-content">{renderAuthButton(type)}</div>

          <ChevronRight
            className="right-align-arrow make-large fa-10x arrow-btn"
            onClick={nextData}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={testAddData}>
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
