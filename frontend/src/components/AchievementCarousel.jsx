import React from 'react';
import Carousel from 'react-multi-carousel';

import 'react-multi-carousel/lib/styles.css';
import '../css/achievementCarousel.css';

// Carousel for users achievements.
const AchievementCarousel = () => {
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
    >
      <div style={{ height: '10em', background: colors[0] }}>Item 1</div>
      <div style={{ height: '10em', background: colors[1] }}>Item 2</div>
      <div style={{ height: '10em', background: colors[2] }}>Item 3</div>
      <div style={{ height: '10em', background: colors[3] }}>Item 4</div>
      <div style={{ height: '10em', background: colors[0] }}>Item 5</div>
      <div style={{ height: '10em', background: colors[1] }}>Item 1</div>
      <div style={{ height: '10em', background: colors[2] }}>Item 2</div>
      <div style={{ height: '10em', background: colors[3] }}>Item 3</div>
      <div style={{ height: '10em', background: colors[0] }}>Item 4</div>
      <div style={{ height: '10em', background: colors[1] }}>Item 5</div>
    </Carousel>
  );
};

export default AchievementCarousel;
