import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';

/* 
Component that shows the specifics for document classification 
*/
const DocumentClassification = ({ data, dataPointId, nextData, labels }) => {
  const [label, setLabel] = useState('');
  const inputRef = useRef();

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, label);
    // nextData();
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
      <hr className="hr-title" data-content="Your Labels" />
      {labels.map((oneLabel) => (
        <li key={oneLabel.label_id}>
          <h1> {oneLabel.label} </h1>
        </li>
      ))}
    </div>
  );
};

{
  /* <ul>
{projects.map((result) => (
  <li key={result}>
    <Project
      created={result[0]}
      id={result[1]}
      name={result[2]}
      projectType={result[3]}
      selectedColor={setColorCounter()}
    />
  </li>
))}
</ul> */
}

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  nextData: PropTypes.func.isRequired,
};
export default DocumentClassification;
