import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
import { generateRandomColor, textBoxSize } from '../util';

/*
Component that shows the specifics for document classification
*/
const DocumentClassification = ({
  data,
  dataPointId,
  getSetLabels,
  defaultLabel,
  setLabel,
  labels,
}) => {
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
      await HTTPLauncher.sendCreateDocumentClassificationLabel(
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

  useEffect(() => {
    if (defaultLabel !== '') {
      (async () => {
        let uniqueLabel = true;
        labels.forEach((label) => {
          if (label.label === defaultLabel) {
            uniqueLabel = false;
          }
        });
        if (uniqueLabel) {
          await HTTPLauncher.sendCreateDocumentClassificationLabel(
            dataPointId,
            defaultLabel,
            generateRandomColor()
          );
          getSetLabels();
        }
      })();
      setLabel('');
    }
  }, [defaultLabel]);

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
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      data_id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      label_id: PropTypes.number.isRequired,
      user_id: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
  defaultLabel: PropTypes.string.isRequired,
  setLabel: PropTypes.func.isRequired,
};

export default DocumentClassification;
