import React from 'react';
import Button from 'react-bootstrap/Button';

import '../../styles.css';

const MarkerHeader = ({ onSubmit }) => {
  return (
    <div className="marker-header">
      <input type="text" placeholder="Add label..." />
      <Button onClick={onSubmit}>Label</Button>
    </div>
  );
};

export default MarkerHeader;
