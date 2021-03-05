import React from 'react';

const ProgressBar = (props) => {
  // eslint-disable-next-line react/prop-types
  const { bgcolor, completed } = props;

  const containerStyles = {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0de',
    borderRadius: 2,
    margin: 50,
  };

  const fillerStyles = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    textAlign: 'right',
  };

  const labelStyles = {
    padding: 5,
    color: 'black',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyles} lg="6" className="d-none d-lg-block">
      <div style={fillerStyles} />
      <span style={labelStyles}>{`${completed}%`}</span>
    </div>
  );
};

export default ProgressBar;
