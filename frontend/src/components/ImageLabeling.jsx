import React, { useRef, useState } from 'react';
import '../css/imageLabeling.css';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import HTTPLauncher from '../services/HTTPLauncher';

// eslint-disable-next-line
import img from '../tests/out/ILSVRC2012_val_00000003.JPEG';
const bigJoe =
  'https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-9/52835846_10212407730083577_1812354183186087936_n.jpg?_nc_cat=101&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=WT0nZMJrx34AX_Lx0UU&tn=2xc4Z9PGvpJTnJ9L&_nc_ht=scontent-arn2-1.xx&oh=444c9260966921498402b6ecbb694902&oe=60AE1408';
// eslint-disable-next-line
const imgg = 'https://i.imgur.com/lFd4waN.jpg';
const ImageLabeling = () => {
  const [cropper, setCropper] = useState();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const getCropData = () => {
    if (typeof cropper !== 'undefined') {
      const width = cropper.getCroppedCanvas().width;
      const height = cropper.getCroppedCanvas().height;
      return [x, y, width, height];
    }
  };

  const handleSubmit = (e) => {
    const cropData = getCropData();
    const dataID = 1;
    console.log('Handle Submit');
    console.log(getCropData());

    HTTPLauncher.sendCreateImageClassificationLabel(
      dataID,
      cropData[0],
      cropData[1],
      cropData[2],
      cropData[3]
    );
  };
  const cropperRef = useRef(null);

  const onCrop = (e) => {
    setX(e.detail.x);
    setY(e.detail.y);
  };

  return (
    <div className="image-container">
      <div>
        <Cropper
          src={imgg}
          style={{ height: 500, width: '100%' }}
          // Cropper.js options
          initialAspectRatio={16 / 9}
          guides={false}
          crop={onCrop}
          ref={cropperRef}
          onInitialized={(instance) => {
            setCropper(instance);
          }}
        />

        <button type="button" style={{ float: 'right' }} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};
export default ImageLabeling;
