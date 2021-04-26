import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
import '../css/SequenceToSequence.css';

/* 
Component that shows the specifics for document classification 
*/
const SequenceToSequence = ({ data, dataPointId, getSetLabels }) => {
  const inputRef = useRef();

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateSequenceToSequenceLabel(dataPointId, inputRef.current.value);
    getSetLabels();
    inputRef.current.value = '';
    inputRef.current.focus();
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [dataPointId]);

  // Choose size of the text to use depending on the length of the text
  const textBoxSize = () => {
    if (data.length < 18) {
      return 'small-text';
    }
    if (data.length < 600) {
      return 'medium-text';
    }
    return 'large-text';
  };

  return (
    <div className="classification-container">
      <div className="text-box-container">
        <p className={`${textBoxSize()}`}>{data}</p>
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
};
export default SequenceToSequence;
