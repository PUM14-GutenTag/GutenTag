import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
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
    inputRef.current.focus();
    setLabel('');
  };

  useEffect(() => {
    inputRef.current.focus();
  }, []);


  return (
    <div className="classification-container">
      <p className="text-container">{data}</p>
    <hr/>
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
         <button className="btn btn-primary label-btn" type="submit">Button</button>
        </Form.Group>
       
        </Form>
        <hr/>
        <h4>Here there should be all the old labels</h4>
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  nextData: PropTypes.func.isRequired,
};
export default DocumentClassification;
