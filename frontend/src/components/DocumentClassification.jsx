import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
// import PropTypes from 'prop-types';

// Component that shows the specifics for document classification
const DocumentClassification = ({ data, dataPointId, nextData }) => {
  const [label, setLabel] = useState('');
  const inputRef = useRef();

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, label);
    nextData();
  };

  /*
  TODO: 

  fixa document classification html/css
  
  Labels gå fram och tillbaka (svår)
    
  fixa så den skalar efter storlek
  */

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [dataPointId]);

  // should perhaps also vary depending on screen size
  // Choose size of the text to use depending on the length of the text
  const textBoxSize = () => {
    if (data.length < 18) {
      return 'small-text';
    }
    if (data.length < 350) {
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
      <h4>Display label suggestions</h4>
      <hr className="hr-title" data-content="Add new label" />
      <div className="form-container">
        <Form onSubmit={addLabel}>
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
      </div>
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
