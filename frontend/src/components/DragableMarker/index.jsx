import React, { useEffect, useState, useRef } from 'react';

import './dragableMarker.css';

const DragableMarker = () => {
  const [mouseDown, setMouseDown] = useState(false);

  const markerRef = useRef(null);

  const handleDrag = (movementX, movementY) => {
    const marker = markerRef.current;
    if (!marker) return;

    const { x, y } = marker.getBoundingClientRect();
    marker.style.left = `${x + movementX}`;
    marker.style.top = `${y + movementY}`;
  };

  useEffect(() => {
    const handleMouseUp = () => setMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.addEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e.movementX, e.movementY);

    if (mouseDown) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseDown, handleDrag]);

  const handleMouseDown = () => setMouseDown(true);

  return (
    <div
      role="presentation"
      className="marker-container"
      onMouseDown={handleMouseDown}
      onDrag={handleDrag}
    />
  );
};
export default DragableMarker;
