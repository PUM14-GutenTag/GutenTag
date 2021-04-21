import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
// import PropTypes from 'prop-types';

const DocumentClassification = ({ data, dataPointId, nextData }) => {
  const [label, setLabel] = useState('');
  const inputRef = useRef();

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, label);
    nextData();
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [dataPointId]);

  // should perhaps also vary depending on screen size
  const textBoxSize = () => {
    if (data.length < 14) {
      return 'small-text-container';
    }
    if (data.length < 20) {
      return 'medium-text-container';
    }
    return 'large-text-container';
  };

  return (
    <div className="classification-container">
      <p className={`${textBoxSize()}`}>{data}</p>

      <hr className="hr-title" data-content="Suggestions" />
      <h4>Display label suggestions</h4>
      <hr className="hr-title" data-content="Add new label" />
      <Form onSubmit={addLabel} className="form">
        <Form.Group controlId="form.name" className="form-group">
          <input
            type="text"
            onChange={(event) => setLabel(event.target.value)}
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
      <hr className="hr-title" data-content="Old labels" />
      <h4>Display old labels</h4>
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  nextData: PropTypes.func.isRequired,
};
export default DocumentClassification;
