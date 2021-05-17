import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import HTTPLauncher from '../services/HTTPLauncher';

const DefaultLabels = ({ projectID }) => {
  const [labels, setLabels] = useState([]);

  const fetchDefaultLabels = async () => {
    const result = await HTTPLauncher.sendGetDefaultLabel(projectID);
    const list = Object.keys(result.data).map((key) => result.data[key].name);
    setLabels(list);
  };

  const sendLabel = (label) => {
    console.log(label);
  };

  useEffect(() => {
    fetchDefaultLabels();
  }, []);

  return (
    <div>
      {labels.map((label) => (
        <Button className="dark" onClick={() => sendLabel(label)} style={{ margin: '0.2em' }}>
          {label}
        </Button>
      ))}
    </div>
  );
};

DefaultLabels.propTypes = {
  projectID: PropTypes.number.isRequired,
};

export default DefaultLabels;
