import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/DocumentClassification.css';
// import PropTypes from 'prop-types';

const DocumentClassification = ({ data, dataPointId, nextData }) => {
  const [label, setLabel] = useState('');

  const addLabel = async (event) => {
    event.preventDefault();
    await HTTPLauncher.sendCreateDocumentClassificationLabel(dataPointId, label);

    nextData();
  };
  return (
    <div className="classification-container">
      <p className="text-container">{data}</p>

      <Form onSubmit={addLabel}>
        <Form.Group controlId="form.name">
          <Form.Control
            type="text"
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Enter label..."
            required
            className="input-box"
          />
        </Form.Group>
        <Button className="btn btn-primary" variant="success" type="submit">
          Pres me
        </Button>
        <button className="amazing-button">Press me</button>
      </Form>
    </div>
  );
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  nextData: PropTypes.func.isRequired,
};
export default DocumentClassification;
