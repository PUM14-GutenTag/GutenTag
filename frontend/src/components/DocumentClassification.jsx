import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
import Label from './Label';

/* 
Component that shows the specifics for document classification 
*/
const DocumentClassification = ({ data, dataPointId, labels, deleteLabel, getSetLabels }) => {
  const inputRef = useRef();

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, inputRef.current.value);
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
      <hr className="hr-title" data-content="Suggestions" />
      <h6>Display label suggestions</h6>
      <hr className="hr-title" data-content="Add new label" />
      <div className="form-container">
        <Form onSubmit={addLabel}>
          <Form.Group controlId="form.name" className="form-group">
            <input
              type="text"
              placeholder="Enter label..."
              required
              className="input-box"
              ref={inputRef}
            />
            <button className="btn btn-primary label-btn" type="submit">
              Label
            </button>
          </Form.Group>
        </Form>
      </div>
      <hr className="hr-title" data-content="Your Labels" />
      <div className="your-labels-container">
        {labels.map((oneLabel) => (
          <div key={oneLabel.label_id}>
            <Label labelId={oneLabel.label_id} label={oneLabel.label} deleteLabel={deleteLabel} />
          </div>
        ))}
      </div>
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  deleteLabel: PropTypes.func.isRequired,
  getSetLabels: PropTypes.func.isRequired,
  labels: PropTypes.arrayOf(PropTypes.object).isRequired,
};
export default DocumentClassification;
