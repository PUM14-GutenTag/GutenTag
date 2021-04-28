import React from 'react';
import Modal from 'react-bootstrap/Modal';
import '../css/FinishedPopUp.css';

const FinishedPopUp = () => {
  return (
    <Modal.Dialog>
      <Modal.Header>
        <Modal.Title>Congratulations, you have labeled everything in this project!</Modal.Title>
      </Modal.Header>
    </Modal.Dialog>
  );
};

export default FinishedPopUp;
