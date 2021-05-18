import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
import { generateRandomColor, textBoxSize } from '../util';

/*
Component that shows the specifics for document classification
*/
const DocumentClassification = ({ data, dataPointId, getSetLabels }) => {
  const inputRef = useRef();

  /* Adds label to a datapoint and and updates what labels are being displayed to the user */
  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(
      dataPointId,
      inputRef.current.value,
      generateRandomColor()
    );
    getSetLabels();
    inputRef.current.value = '';
    inputRef.current.focus();
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
      <hr className="hr-title" data-content="Add new label" />
      <div className="form-container">
        <Form onSubmit={addLabel}>
          <Form.Group controlId="form.name" className="form-group">
            <input
              type="text"
              placeholder="Enter label..."
              required
              id="input-box"
              className="text"
              ref={inputRef}
            />
            <button id="submit-label-btn" className="btn dark label-btn" type="submit">
              Label
            </button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
};

export default DocumentClassification;
