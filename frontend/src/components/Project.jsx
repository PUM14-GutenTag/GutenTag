import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../css/project.css';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { GearFill } from 'react-bootstrap-icons';

const Project = ({ id, name, created, projectType, selectedColor }) => {
  const [showInfo, setShowInfo] = useState(false);
  const projectTypeNames = [
    'Document classification',
    'Sequence labeling',
    'Sequence to sequence labeling',
    'Image classification',
  ];

  const toggleInfo = () => {
    setShowInfo((previousValue) => !previousValue);
  };
  return (
    <div className="project-container" style={{ backgroundColor: selectedColor }}>
      <div className="title-container" onClick={toggleInfo} aria-hidden="true">
        <h1>{name}</h1>
        <ProgressBar now={50} striped id="progress-bar-project" />
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
      <Link
        className="edit-link"
        to={{
          pathname: '/edit-project',
          state: {
            id,
            name,
            projectType,
          },
        }}
      >
        <GearFill />
      </Link>
    </div>
  );
};

Project.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
  projectType: PropTypes.number.isRequired,
  selectedColor: PropTypes.string.isRequired,
};

export default Project;
