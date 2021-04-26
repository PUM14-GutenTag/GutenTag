import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
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

  async function getSetLabels(dataPoints = listOfDataPoints, tempDataCounter = dataCounter) {
    if (typeof dataPoints[tempDataCounter] !== 'undefined') {
      const response = await HTTPLauncher.sendGetLabel(projectId, dataPoints[tempDataCounter][0]);
      if (response.data != null) {
        setLabels(Object.values(response.data));
        console.log(Object.values(response.data));
      } else {
        setLabels([]);
      }
    }
  }

  /*
  TODO:
  En framför har labels ta bort ur listan
  error vid slutet när allt är labelat (vänta)
  */

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
    const response = await HTTPLauncher.sendAddNewTextData(
      projectId,
      JSON.stringify([
        // {
        //   text:
        //     'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s,' +
        //     'when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap' +
        //     'into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum' +
        //     'passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        //   labels: [],
        // },
        // {
        //   text:
        //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sed consectetur justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel mauris commodo, dictum libero iaculis, dictum nulla. Sed ac sodales justo. Etiam sit amet arcu faucibus, facilisis massa id, rhoncus odio. Pellentesque arcu enim, malesuada non neque a, hendrerit ullamcorper libero. Donec vitae ullamcorper diam, eget convallis purus. Curabitur eleifend imperdiet tempor. Curabitur ac orci nunc. Nullam sed orci nisl. Praesent malesuada ligula id rutrum luctus. Phasellus maximus magna at ex lobortis, at convallis lectus iaculis. Donec laoreet pulvinar velit at rhoncus. Praesent hendrerit, felis at ultrices viverra, quam ante semper neque, sit amet elementum sem sapien eu libero. Nullam vulputate consequat lorem vel aliquam. Pellentesque rhoncus eget ligula ac porttitor.Vestibulum facilisis fringilla mauris ut hendrerit. Integer eu lobortis nisi. Mauris porttitor nisi porttitor commodo euismod. Pellentesque gravida hendrerit mauris, in dictum massa blandit quis. Sed non nulla vel felis aliquet finibus at non turpis. Vestibulum tincidunt arcu ac luctus convallis. Sed eget scelerisque quam, sed pellentesque turpis. Pellentesque tincidunt libero nulla, non pretium nisl varius ac. Maecenas lobortis mattis massa, et ornare justo egestas sit amet. Proin pretium odio non varius lobortis. Nam laoreet enim vitae magna aliquam, non lobortis odio aliquet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec tempor sodales posuere. Morbi eget iaculis augue. Mauris scelerisque interdum bibendum.' +
        //     'Phasellus lobortis elit sit amet vestibulum lobortis. Vestibulum mattis vulputate metus, at tempor magna scelerisque at. Donec nec mollis nulla, nec fermentum augue. Nunc convallis mauris sit amet pharetra finibus. Nulla facilisi. In congue purus nisi. Mauris porta nisi et turpis cursus blandit. Pellentesque semper urna id magna laoreet vulputate ac quis nisl. Curabitur mattis, erat vitae malesuada viverra, nisi turpis fringilla tellus, et lacinia nulla dolor convallis lorem. Aliquam finibus justo sed facilisis tincidunt.' +
        //     'Ut mattis, dolor eget venenatis hendrerit, sapien turpis consequat est, vitae vehicula diam est et nunc. Pellentesque non urna lacus. Pellentesque eu ex urna. Donec vehicula, risus sed euismod pretium, odio augue tincidunt massa, a imperdiet quam justo quis purus. Praesent rhoncus hendrerit elit eget lacinia. Nulla eget vehicula augue. In cursus libero sit amet nulla pellentesque ornare. Curabitur in pulvinar metus, vitae lobortis ligula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris fermentum, nisl at interdum dapibus, lectus tortor semper nulla, sit amet euismod dolor quam in libero. In viverra arcu eget purus scelerisque, in vestibulum libero elementum.' +
        //     'Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras venenatis non ex eget commodo. Donec tempor vestibulum urna, id dapibus turpis interdum id. Fusce vel tincidunt nisl, eu volutpat diam. Curabitur non cursus odio, quis rhoncus ante. Maecenas elementum est non pretium pulvinar. Praesent ornare dui ante, eget dapibus mi venenatis et. Donec tincidunt justo eu lectus malesuada fringilla et nec tellus. Suspendisse nec ligula justo. Vivamus eleifend risus sit amet fermentum tincidunt. Proin eget libero eu massa bibendum varius.',
        //   labels: [],
        // },
        // {
        //   text: 'Data nummer 3',
        //   labels: [],
        // },
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
        // {
        //   text: 'Data nummer 8',
        //   labels: [],
        // },
        // {
        //   text: 'Data nummer 9',
        //   labels: [],
        // },
        // {
        //   text: 'Data nummer 10',
        //   labels: [],
        // },
        // {
        //   text: 'Data nummer 11',
        //   labels: [],
        // },
        // {
        //   text: 'Data nummer 12',
        //   labels: [],
        // },
      ])
    );
    console.log(response);
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

  // Go to next datapoint, and get a new one
  const nextData = async () => {
    const tempDataCounter = dataCounter + 1;
    let newListOfDataPoints=listOfDataPoints;
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

  const dataCounterLogic = async (incrementDataPoint, newListOfDataPoints=listOfDataPoints) => {
    /* 
    If current data point has been labeled check if there exist data points 
    with the same data and higher index in the list, then remove them.
    */
    const currentDataPoint = newListOfDataPoints[dataCounter];
    let dataPointExists = false;
    let removeIndexList = [];
    let counterAdjust = 0;
    let newDataCounter = 0;
    // iterate list of data points with higher index than current data point
    // and check if there exist data points with the same data
    for (let i = 0; i < newListOfDataPoints.length; i++) {
      //skip current data point
      if (i===dataCounter){
      }
      else if (JSON.stringify(currentDataPoint) === JSON.stringify(newListOfDataPoints[i])) {
        dataPointExists = true;
        removeIndexList.push(i); // list of all index in the future which has to be removed
        
        //if index less then current data point then add tp counter adjustment
        if (i<dataCounter){
          counterAdjust = counterAdjust + 1;
        }
      }
    }
    //check if current data point has been labeled
    if (dataPointExists) {
      const response = await HTTPLauncher.sendGetLabel(projectId, currentDataPoint[0]);
      if (response.data != null) {
        setDataCounter(dataCounter-counterAdjust+incrementDataPoint);
        newDataCounter=dataCounter-counterAdjust+incrementDataPoint;
        //create copy of list of data points
        const tempListOfDataPoints = newListOfDataPoints.slice();
        removeIndexList.reverse()
        for (let i = 0; i < removeIndexList.length; i++) {
          tempListOfDataPoints.splice(removeIndexList[i], 1);
        }
        setListOfDataPoints(tempListOfDataPoints);
        newListOfDataPoints=tempListOfDataPoints;
      }
      else{
        setDataCounter(dataCounter+incrementDataPoint);
        newDataCounter = dataCounter+incrementDataPoint;
      }
    }
    else{
      setDataCounter(dataCounter+incrementDataPoint);
      newDataCounter = dataCounter+incrementDataPoint;
    }
    getSetLabels(newListOfDataPoints, newDataCounter);
  };

  const selectProjectComponent = (typeOfProject) => {
    if (listOfDataPoints[dataCounter]) {
      if (typeOfProject === '1') {
        return (
          <DocumentClassification
            data={listOfDataPoints[dataCounter][1]}
            dataPointId={parseInt(listOfDataPoints[dataCounter][0])}
            labels={labels}
            deleteLabel={deleteLabel}
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

  const suggestionLabels = (typeOfProject) => {
    /* Seq to Seq should not display suggestions*/ 
    if (typeOfProject !== "2"){
      return (<> <hr className="hr-title" data-content="Suggestions" />
      <h6> [Insert suggestions from admin]</h6> </>);
    }
  }

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

            {/* Project type component*/}
            <div className="data-content">
              {suggestionLabels(type)}
              
              {selectProjectComponent(type)}
              
              <hr className="hr-title" data-content="Your Labels" />
              <div className="your-labels-container">
              {labels.map((oneLabel) => (<div key={oneLabel.label_id}>
              <Label labelId={oneLabel.label_id} label={oneLabel.label} deleteLabel={deleteLabel} />
              </div>))}
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
