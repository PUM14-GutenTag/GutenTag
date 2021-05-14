import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../css/project.css';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { GearFill } from 'react-bootstrap-icons';

const Project = ({
  id,
  name,
  created,
  projectType,
  progress,
  selectedColor,
  showEditButton,
  labelsPerDatapoint,
}) => {
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
    <div
      className="project-container"
      onMouseUp={toggleInfo}
      aria-hidden="true"
      style={{ backgroundColor: selectedColor }}
    >
      <div className="title-container" aria-hidden="true">
        <h1>{name}</h1>
        <ProgressBar now={progress} striped id="progress-bar-project" />
      </div>
      {showInfo ? (
        <div className="projectInfo">
          <div className="left-info">
            <p>Type: {projectTypeNames[projectType - 1]}</p>
            <p>Progress: 1/4 </p>
            <p>Started: {created}</p>
            <p>Labels per datapoint: {labelsPerDatapoint}</p>
          </div>
        </div>
      ) : null}
      <Button
        variant="outline-primary"
        as={Link}
        to={{
          pathname: '/labeling',
          state: {
            projectType,
            id,
            progress,
          },
        }}
      >
        Start
      </Button>
      {showEditButton && (
        <Link
          className="edit-link"
          to={{
            pathname: '/edit-project',
            state: {
              id,
              name,
              projectType,
              labelsPerDatapoint,
            },
          }}
        >
          <GearFill />
        </Link>
      )}
    </div>
  );
};

Project.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
  projectType: PropTypes.number.isRequired,
  selectedColor: PropTypes.string.isRequired,
  showEditButton: PropTypes.bool,
  labelsPerDatapoint: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

Project.defaultProps = {
  showEditButton: false,
};

export default Project;
