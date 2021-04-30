import React, { useState, useEffect } from 'react';

import './styles.css';

const Drager = ({ reference }) => {
  const [pressed, setPressed] = useState(false);

  const handleMouseDown = () => setPressed(true);
  const handleMouseUp = () => setPressed(false);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.addEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleDrag = (movementX, movementY) => {
      const marker = reference.current;
      if (!marker) return;
      const { x, y } = marker.getBoundingClientRect();
      marker.style.left = `${x + movementX}px`;
      marker.style.top = `${y + movementY}px`;
    };

    const handleMouseMove = (e) => handleDrag(e.movementX, e.movementY);
    if (pressed) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pressed, reference]);

  return <div className="drager" onMouseDown={handleMouseDown}></div>;
};
export default Drager;
