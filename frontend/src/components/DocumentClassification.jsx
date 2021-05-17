import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';

/*
Component that shows the specifics for document classification
*/
const DocumentClassification = ({
  data,
  dataPointId,
  getSetLabels,
  textBoxSize,
  label,
  setLabel,
}) => {
  const inputRef = useRef();

  /* Adds label to a datapoint and and updates what labels are being displayed to the user */
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

  useEffect(() => {
    if (label !== '') {
      (async () => {
        await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, label);
        getSetLabels();
      })();
      setLabel('');
    }
  }, [label]);

  return (
    <div className="classification-container">
      <div className="text-box-container">
        <p className={textBoxSize}>{data}</p>
      </div>
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
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
  textBoxSize: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  setLabel: PropTypes.func.isRequired,
};

export default DocumentClassification;
