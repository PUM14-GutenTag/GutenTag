import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown } from 'react-bootstrap-icons';

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
    <div className="noselect input-spinner">
      <ChevronUp onClick={handleUp} className="fa-5x arrow-btn" /> <h1>{counter}</h1>
      <ChevronDown onClick={handleDown} className="fa-5x arrow-btn" />
    </div>
  );
};

InputSpinner.propTypes = {
  amount: PropTypes.number.isRequired,
  setAmount: PropTypes.func.isRequired,
};

export default InputSpinner;
