import React from 'react';
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';
import '../css/Label.css';

/* Creates a label for a datapoint and add delete button for label */
const Label = ({ labelId, label, deleteLabel, color }) => {
  // Generates random light color

  return (
    <Badge style={{ backgroundColor: color }}>
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
  color: PropTypes.string.isRequired,
  deleteLabel: PropTypes.func.isRequired,
};

export default Label;
