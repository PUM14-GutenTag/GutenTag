import React from 'react';
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';
import '../css/Label.css';

const Label = ({ label_id, label, deleteLabel }) => {
  
  //generates random color that is not too bright
  const generateRandomColor = () =>
  {
    const red = Math.floor(1  + Math.random() * 256*1.7);
    const green = Math.floor(1 + Math.random() * 256*1.7);
    const blue = Math.floor(2 + Math.random() * 256*1.2);
    console.log("rgb(" + red + ", " + green + ", " + blue + ")");
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  };

  return (
      <Badge style={{backgroundColor:generateRandomColor()}}>
        <div className="label-list">
        <p className="label-text">{label}</p>
        <button type="button" className="close" aria-label="Close" onClick={() => deleteLabel(label_id)} >
          <span aria-hidden="true">&times;</span>
        </button>  
        </div>   
      </Badge>
  );
};

Label.propTypes = {
  label_id: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  deleteLabel: PropTypes.func.isRequired,
};

export default Label;
