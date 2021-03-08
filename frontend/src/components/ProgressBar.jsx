import React from 'react';
import '../css/ProgressBar.css';

// eslint-disable-next-line react/prop-types
const ProgressBar = ({ bgcolor, completed }) => {
  const fillerStyles = {
    width: `${completed}%`,
    backgroundColor: bgcolor,
  };

  return (
    <div lg="6" className="container d-none d-lg-block">
      <div style={fillerStyles} className="filler" />
      <span className="label">{`${completed}%`}</span>
    </div>
  );
};

export default ProgressBar;
