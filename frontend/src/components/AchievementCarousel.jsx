import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Carousel from 'react-multi-carousel';

import HTTPLauncher from '../services/HTTPLauncher';

import 'react-multi-carousel/lib/styles.css';
import '../css/achievementCarousel.css';

const colors = ['#E2D0F5', '#FDD4E6', '#FFEACC', '#CDFFFF'];

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

// Carousel for users achievements.
const AchievementCarousel = ({ containerClass }) => {
  const [achievements, setAchievements] = useState([]);

  const getAchievements = async () => {
    const response = await HTTPLauncher.sendGetAchievements();
    const sorted = response.data.sort((a, b) => {
      if (a.earned == null && b.earned != null) return 1;
      if (a.earned != null && b.earned == null) return -1;
      return 0;
    });
    setAchievements(sorted);
  };

  useEffect(() => getAchievements(), []);

  return (
    <Carousel
      responsive={responsive}
      infinate
      showDots={false}
      ssr // means to render carousel on server-side.
      keyBoardControl
      removeArrowOnDeviceType={['tablet', 'mobile']}
      itemClass="carousel-item-custom"
      centerMode
      containerClass={containerClass}
      slidesToSlide={4}
    >
      {achievements.map((achievement, i) => {
        const opacity = achievement.earned == null ? 0.55 : 1;
        return (
          <div
            className="no-select carousel-item-container"
            style={{ opacity, background: colors[i % 4] }}
            key={achievement.name}
          >
            <div className="carousel-item-header">{achievement.name}</div>
            <div className="carousel-item-description">{achievement.description}</div>
            <div className="carousel-item-body">{achievement.earned}</div>
          </div>
        );
      })}
    </Carousel>
  );
};

AchievementCarousel.propTypes = {
  containerClass: PropTypes.string,
};

AchievementCarousel.defaultProps = {
  containerClass: null,
};

export default AchievementCarousel;
