import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

import Resizer from './components/Resizer';
import MarkerHeader from './components/MarkerHeader';

const Marker = ({ onSubmit }) => {
  const [pressed, setPressed] = useState(false);

  const markerRef = useRef(null);

  const handleDrag = (movementX, movementY) => {
    const marker = markerRef.current;
    if (!marker) return;
    const { x, y } = marker.getBoundingClientRect();
    marker.style.left = `${x + movementX}px`;
    marker.style.top = `${y + movementY}px`;
  };

  const handleMouseDown = () => setPressed(true);

  useEffect(() => {
    const handleMouseUp = () => setPressed(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.addEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e.movementX, e.movementY);
    if (pressed) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pressed]);

  return (
    <div className="marker" ref={markerRef} onMouseDown={handleMouseDown}>
      <Resizer reference={markerRef} />
      <MarkerHeader onSubmit={onSubmit} />
    </div>
  );
};
export default Marker;
