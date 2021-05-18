import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const InputSpinner = ({ amount, setAmount }) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setCounter(amount);
  }, [amount]);

  const handleUp = () => {
    setCounter(counter + 1);
    setAmount(counter + 1);
  };
  const handleDown = () => {
    if (counter <= 1) {
      setCounter(1);
    } else {
      setCounter(counter - 1);
      setAmount(counter - 1);
    }
  };

  return (
    <div className="no-select input-spinner">
      <ChevronLeft onClick={handleDown} className="fa-3x arrow-btn" /> <h1>{counter}</h1>
      <ChevronRight onClick={handleUp} className="fa-3x arrow-btn" />
    </div>
  );
};

InputSpinner.propTypes = {
  amount: PropTypes.number.isRequired,
  setAmount: PropTypes.func.isRequired,
};

export default InputSpinner;
