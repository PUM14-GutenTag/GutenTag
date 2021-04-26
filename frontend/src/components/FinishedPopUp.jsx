import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/FinishedPopUp.css';

const FinishedPopUp = () => {
  return (
    <Modal.Dialog>
      <Modal.Header>
        <Modal.Title>Congratulations! You have finished this project</Modal.Title>
      </Modal.Header>

      <Modal.Footer className="modal-footer">
        <Button
          variant="primary"
          onClick={() => {
            window.location.href = 'http://localhost:3000/home';
          }}
        >
          Go back
        </Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default FinishedPopUp;
