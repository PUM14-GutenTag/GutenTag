import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
// Cropper library
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import HTTPLauncher from '../services/HTTPLauncher';

/*
Component that shows a image, you are able to crop the img with a label
*/
const ImageLabeling = ({ dataPointId, getSetLabels }) => {
  const inputRef = useRef();
  const cropperRef = useRef();

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [imgSource, setImageSource] = useState(null);
  const [cropper, setCropper] = useState();

  // Returns the relevant data from the cropper
  const getCropData = () => {
    if (typeof cropper !== 'undefined') {
      const width = cropper.getCroppedCanvas().width;
      const height = cropper.getCroppedCanvas().height;
      return [x, y, width, height];
    }
    return [x, y, 0, 0];
  };

  // Adds label to the datapoint and updates the labels that are being shown for the user
  const addLabel = async (event) => {
    event.preventDefault();
    const cropData = getCropData();
    await HTTPLauncher.sendCreateImageClassificationLabel(
      dataPointId,
      inputRef.current.value,
      cropData[0],
      cropData[1],
      cropData[2],
      cropData[3]
    );
    getSetLabels();
    inputRef.current.value = '';
    inputRef.current.focus();
  };

  // Sends a request to the database for the img source and sets it in a state
  const getImage = async (id) => {
    const response = await HTTPLauncher.sendGetImageData(id);
    console.log(response);
    const source = URL.createObjectURL(response.data);
    if (imgSource != null) URL.revokeObjectURL(imgSource);
    setImageSource(source);
  };

  // What to happen when we change datapoint to label
  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
    getImage(dataPointId);
  }, [dataPointId]);

  // Sets X and Y states when cropping
  const onCrop = (e) => {
    setX(e.detail.x);
    setY(e.detail.y);
  };

  return (
    <div className="image-container">
      <div>
        <Cropper
          src={imgSource}
          style={{ height: 400, width: '100%' }}
          // Cropper.js options
          initialAspectRatio={16 / 9}
          guides={false}
          crop={onCrop}
          ref={cropperRef}
          onInitialized={(instance) => {
            setCropper(instance);
          }}
        />
        <hr className="hr-title" data-content="Add new label" />
        <div className="form-container">
          <Form onSubmit={addLabel}>
            <Form.Group controlId="form.name" className="form-group">
              <input
                type="text"
                placeholder="Enter label..."
                required
                className="input-box"
                ref={inputRef}
              />
              <button className="btn btn-primary label-btn" type="submit">
                Label
              </button>
            </Form.Group>
          </Form>
        </div>
      </div>
    </div>
  );
};

ImageLabeling.propTypes = {
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
};

export default ImageLabeling;
