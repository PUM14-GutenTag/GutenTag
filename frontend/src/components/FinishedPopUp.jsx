import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import '../css/FinishedPopUp.css';

/* Pop up for when the user has labeled all datapoints in a project */
const FinishedPopUp = ({ projectDone }) => {
  return (
    <Modal.Dialog>
      <Modal.Header>
        {projectDone ? (
          <Modal.Title>
            Congratulations, all datapoints in this project are now fully labeled!
          </Modal.Title>
        ) : (
          <Modal.Title>Congratulations, you have labeled everything in this project!</Modal.Title>
        )}
      </Modal.Header>
    </Modal.Dialog>
  );
};

FinishedPopUp.propTypes = {
  projectDone: PropTypes.bool.isRequired,
};

export default FinishedPopUp;
