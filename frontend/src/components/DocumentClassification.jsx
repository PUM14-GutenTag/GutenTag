import React from 'react';
import PropTypes from 'prop-types';
// import PropTypes from 'prop-types';

const DocumentClassification = ({ data }) => {
  return <>{data}</>;
};

DocumentClassification.propTypes = {
  data: PropTypes.string.isRequired,
};
export default DocumentClassification;
