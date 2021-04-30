import React, { useRef } from 'react';
import './styles.css';

import Resizer from './components/Resizer';
import MarkerHeader from './components/MarkerHeader';
import Drager from './components/Drager';

const Marker = ({ onSubmit }) => {
  const markerRef = useRef(null);

  return (
    <div className="marker" ref={markerRef}>
      <MarkerHeader onSubmit={onSubmit} />
      <Drager reference={markerRef} />
      <Resizer reference={markerRef} />
    </div>
  );
};
export default Marker;
