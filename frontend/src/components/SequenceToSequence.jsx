import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
import '../css/SequenceToSequence.css';
import { generateRandomColor, textBoxSize } from '../util';

/* 
Component that shows the specifics for sequence to sequence labeling 
*/
const SequenceToSequence = ({ data, dataPointId, getSetLabels, labels }) => {
  const inputRef = useRef();

  /* Adds label to a datapoint and and updates what labels are being displayed to the user */
  const addLabel = async (event) => {
    event.preventDefault();
    let uniqueLabel = true;
    labels.forEach((label) => {
      if (label.label === inputRef.current.value) {
        uniqueLabel = false;
      }
    });
    if (uniqueLabel) {
      await HTTPLauncher.sendCreateSequenceToSequenceLabel(
        dataPointId,
        inputRef.current.value,
        generateRandomColor()
      );
      getSetLabels();
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [dataPointId]);

  return (
    <div className="classification-container">
      <div className="text-box-container">
        <p style={{ fontSize: textBoxSize(data) }}>{data}</p>
      </div>
      <hr className="hr-title" data-content="Add new sequence" />
      <div className="form-container">
        <Form onSubmit={addLabel}>
          <Form.Group controlId="form.name" className="form-group">
            <input
              type="text"
              placeholder="Enter a sequence..."
              required
              className="input-box-seq-seq"
              ref={inputRef}
            />
            <button className="btn btn-primary label-btn-seq-seq" type="submit">
              Label
            </button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

SequenceToSequence.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      data_id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      label_id: PropTypes.number.isRequired,
      user_id: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
};

export default SequenceToSequence;
