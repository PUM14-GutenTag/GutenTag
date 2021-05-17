import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import HTTPLauncher from '../services/HTTPLauncher';

// Components that shows available default labels.
const DefaultLabels = ({ projectID, setLabel }) => {
  const [labels, setLabels] = useState([]);

  // Fetch default labels.
  const fetchDefaultLabels = async () => {
    const result = await HTTPLauncher.sendGetDefaultLabel(projectID);
    const list = Object.keys(result.data).map((key) => result.data[key].name);
    setLabels(list);
  };

  useEffect(() => {
    fetchDefaultLabels();
  }, []);

  return (
    <div>
      {labels.map((label) => (
        <Button className="dark" onClick={() => setLabel(label)} style={{ margin: '0.2em' }}>
          {label}
        </Button>
      ))}
    </div>
  );
};

DefaultLabels.propTypes = {
  projectID: PropTypes.number.isRequired,
  setLabel: PropTypes.func.isRequired,
};

export default DefaultLabels;
