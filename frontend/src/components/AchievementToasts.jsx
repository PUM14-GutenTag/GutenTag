import React from 'react';
import PropTypes from 'prop-types';

import Toast from 'react-bootstrap/Toast';

/* Achievement popup to be displayed when user earns an achievement.
 * Several may be stacked on top of each other.
 */
const AchievementToast = ({ achievement, onClose }) => {
  return (
    <Toast autohide delay={5000} onClose={onClose}>
      <Toast.Header>
        <strong>{achievement.name}</strong>
        <small>{achievement.earned}</small>
      </Toast.Header>
      <Toast.Body>{achievement.description}</Toast.Body>
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
