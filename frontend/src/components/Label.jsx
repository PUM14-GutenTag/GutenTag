import React from 'react';
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';
import '../css/Label.css';

const Label = ({ label, data }) => {
  return (
    <span>
      <Badge className="badge badge-primary label-list">
        Label: {label} Data: {data}
      </Badge>
    </span>
  );
};

Label.propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
};

export default Label;
