import React from 'react';
import PropTypes from 'prop-types';

import Toast from 'react-bootstrap/Toast';

import '../css/achievementToast.css';

/* Achievement popup to be displayed when user earns an achievement.
 * Several may be stacked on top of each other.
 */
const AchievementToast = ({ achievement, onClose }) => {
  return (
    <Toast className="no-select" autohide delay={5000} onClose={onClose}>
      <Toast.Header className="achievement-toast-header">
        <strong>Achievement earned!</strong>
      </Toast.Header>
      <Toast.Body className="achievement-toast-body">
        <div className="achievement-title">{achievement.name}</div>
        <div className="achievement-subtitle">{achievement.description}</div>
        <div className="achievement-footnote">{achievement.earned}</div>
      </Toast.Body>
    </Toast>
  );
};

AchievementToast.propTypes = {
  achievement: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    earned: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

AchievementToast.defaultProps = {
  onClose: () => {},
};

export default AchievementToast;
