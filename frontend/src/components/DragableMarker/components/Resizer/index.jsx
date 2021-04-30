import React, { useEffect, useState } from 'react';
import { Direction } from './constants';
import './styles.css';

const Resizer = ({ reference }) => {
  const [direction, setDirection] = useState('');
  const [pressed, setPressed] = useState(false);
  // eslint-disable-next-line
  const handleResize = (direction, movementX, movementY) => {
    const marker = reference.current;
    const { width, height, x, y } = marker.getBoundingClientRect();

    const resizeTop = () => {
      marker.style.height = `${height - movementY}px`;
      marker.style.top = `${y + movementY}px`;
    };
    const resizeRight = () => {
      marker.style.width = `${width + movementX}px`;
      marker.style.right = `${x - movementX}px`;
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!direction) return;
      handleResize(direction, e.movementX, e.movementY);
    };
    if (pressed) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pressed, direction, handleResize]);

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
