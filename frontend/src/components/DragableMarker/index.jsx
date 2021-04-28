import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

import { Direction } from './components/Resizer/constants';
import Resizer from './components/Resizer';
import MarkerHeader from './components/MarkerHeader';

const Marker = ({ children }) => {
  const [pressed, setPressed] = useState(false);

  const markerRef = useRef(null);

  const handleDrag = (movementX, movementY) => {
    const marker = markerRef.current;
    if (!marker) return;
    const { x, y } = marker.getBoundingClientRect();
    marker.style.left = `${x + movementX}px`;
    marker.style.top = `${y + movementY}px`;
  };

  const handleResize = (direction, movementX, movementY) => {
    const marker = markerRef.current;
    const { width, height, x, y } = marker.getBoundingClientRect();

    const resizeTop = () => {
      marker.style.height = `${height - movementY}px`;
      marker.style.top = `${y + movementY}px`;
    };
    const resizeRight = () => {
      marker.style.width = `${width + movementX}px`;
    };
    const resizeBottom = () => {
      marker.style.height = `${height + movementY}px`;
    };
    const resizeLeft = () => {
      marker.style.width = `${width - movementX}px`;
      marker.style.left = `${x + movementX}px`;
    };
    switch (direction) {
      case Direction.TopLeft:
        resizeTop();
        resizeLeft();
        break;

      case Direction.Top:
        resizeTop();
        break;

      case Direction.TopRight:
        resizeTop();
        resizeRight();
        break;

      case Direction.Right:
        resizeRight();
        break;

      case Direction.BottomRight:
        resizeBottom();
        resizeRight();
        break;

      case Direction.Bottom:
        resizeBottom();
        break;

      case Direction.BottomLeft:
        resizeBottom();
        resizeLeft();
        break;

      case Direction.Left:
        resizeLeft();
        break;

      default:
        break;
    }
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
      <div className="marker-container">
        <div className="move-container">
          <Resizer onResize={handleResize} />
          <MarkerHeader />
          <div className="marker-content">{children}</div>
        </div>
      </div>
    </div>
  );
};
export default Marker;
