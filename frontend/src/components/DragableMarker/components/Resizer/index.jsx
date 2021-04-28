import React, { useEffect, useState } from 'react';
import { Direction } from './constants';
import './styles.css';

const Resizer = ({ onResize }) => {
  const [direction, setDirection] = useState('');
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!direction) return;
      onResize(direction, e.movementX, e.movementY);
    };
    if (pressed) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pressed, direction, onResize]);

  useEffect(() => {
    const handleMouseUp = () => setPressed(false);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (direction) => () => {
    setDirection(direction);
    setPressed(true);
  };

  return (
    <div>
      <div className="top-left" onMouseDown={handleMouseDown(Direction.TopLeft)}></div>
      <div className="top" onMouseDown={handleMouseDown(Direction.Top)}></div>
      <div className="top-right" onMouseDown={handleMouseDown(Direction.TopRight)}></div>
      <div className="right" onMouseDown={handleMouseDown(Direction.Right)}></div>
      <div className="right-bottom" onMouseDown={handleMouseDown(Direction.BottomRight)}></div>
      <div className="bottom" onMouseDown={handleMouseDown(Direction.Bottom)}></div>
      <div className="left-bottom" onMouseDown={handleMouseDown(Direction.BottomLeft)}></div>
      <div className="left" onMouseDown={handleMouseDown(Direction.Left)}></div>
    </div>
  );
};
export default Resizer;
