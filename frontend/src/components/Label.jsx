import React from 'react';
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';
import '../css/Label.css';

/* Creates a label for a datapoint and add delete button for label */
const Label = ({ labelId, label, deleteLabel }) => {
  // Generates random light color
  const generateRandomColor = () => {
    const green = Math.floor(1 + Math.random() * 256 * 1.7);
    const blue = Math.floor(2 + Math.random() * 256 * 1.2);
    const red = Math.floor(1 + Math.random() * 256 * 1.7);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <Badge style={{ backgroundColor: generateRandomColor() }}>
      <div className="label-list">
        <p className="label-text">{label}</p>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => deleteLabel(labelId)}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </Badge>
  );
};

Label.propTypes = {
  labelId: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  deleteLabel: PropTypes.func.isRequired,
};

export default Label;
