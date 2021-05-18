import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../css/project.css';
import Button from 'react-bootstrap/Button';
import { Accordion, Card } from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { GearFill, CaretDownFill, CaretLeftFill } from 'react-bootstrap-icons';

const Project = ({
  id,
  name,
  created,
  progress,
  projectType,
  selectedColor,
  showEditButton,
  labelsPerDatapoint,
}) => {
  const projectTypeNames = [
    'Document classification',
    'Sequence labeling',
    'Sequence to sequence labeling',
    'Image classification',
  ];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Accordion>
        <Card className="project-header">
          <Accordion.Toggle
            style={{ backgroundColor: selectedColor }}
            as={Card.Header}
            eventKey="0"
            onClick={() => setOpen(!open)}
          >
            <div className="title-container" aria-hidden="true">
              <h1>{name}</h1>
              {open ? (
                <CaretLeftFill className="arrow-down" color="#063954" />
              ) : (
                <CaretDownFill className="arrow-down" color="#063954" />
              )}
              <ProgressBar now={progress} striped id="progress-bar-project" />
            </div>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body className="project-info">
              <p className="paragraf-text">Type: {projectTypeNames[projectType - 1]}</p>
              <p className="paragraf-text">Progress: 1/4 </p>
              <p className="paragraf-text">Started: {created}</p>
              <p>Labels per datapoint: {labelsPerDatapoint}</p>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card className="project-footer">
          <Accordion.Toggle
            style={{ backgroundColor: selectedColor }}
            as={Card.Header}
            eventKey="0"
            onClick={() => setOpen(!open)}
          >
            <Button
              className="outline-dark"
              variant="outline-primary"
              as={Link}
              to={{
                pathname: '/labeling',
                state: {
                  projectType,
                  id,
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
          </Accordion.Toggle>
        </Card>
      </Accordion>
    </div>
  );
};

Project.propTypes = {
  showEditButton: PropTypes.bool,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  projectType: PropTypes.number.isRequired,
  selectedColor: PropTypes.string.isRequired,
  labelsPerDatapoint: PropTypes.number.isRequired,
};

Project.defaultProps = {
  showEditButton: false,
};

export default Project;
