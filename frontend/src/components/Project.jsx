import React, { useState } from 'react';
import '../css/project.css';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

const Project = ({ name, created, projectType, selectedColor }) => {
  const [showInfo, setShowInfo] = useState(false);
  const projectTypeNames = [
    'Text classification',
    'Image classification',
    'Sequence to Sequence',
    'Sequence labeling',
  ];

  const toggleInfo = () => {
    setShowInfo((previousValue) => !previousValue);
  };

  return (
    <div
      className="project-container"
      style={{ backgroundColor: selectedColor }}
      onClick={toggleInfo}
    >
      <div>
        <div>
          <h1>{name}</h1>
        </div>
        <div className="progress-bar-project">
          <ProgressBar animated now={50} striped />
        </div>
      </div>
      {showInfo ? (
        <div className="projectInfo">
          <div className="left-info">
            <p>Type: {projectTypeNames[projectType]}</p>
            <p>Progress: 1/4 </p>
            <p>Started: {created}</p>
            <Button variant="outline-primary">Start</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Project;
