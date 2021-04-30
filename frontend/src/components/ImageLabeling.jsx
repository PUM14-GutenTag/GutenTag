import React from 'react';
import '../css/imageLabeling.css';
import DragableMarker from './DragableMarker';

const ImageLabeling = () => {
  const handleSubmit = (left, top, height, width) => {
    console.log('Handle Submit');
  };

  return (
    <div className="image-container">
      <h1>Image</h1>
      <div>
        <DragableMarker onSubmit={handleSubmit}></DragableMarker>
        <img
          height="500px"
          alt="img"
          src="https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-9/52835846_10212407730083577_1812354183186087936_n.jpg?_nc_cat=101&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=WT0nZMJrx34AX_Lx0UU&tn=2xc4Z9PGvpJTnJ9L&_nc_ht=scontent-arn2-1.xx&oh=444c9260966921498402b6ecbb694902&oe=60AE1408"
        />
      </div>
    </div>
  );
};
export default ImageLabeling;
