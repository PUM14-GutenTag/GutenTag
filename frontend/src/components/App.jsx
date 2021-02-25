import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

import '../css/App.css';

import logo from '../res/logo.svg';

const axios = require('axios');

// Placeholder content from create-react-app script.
function App() {
  const [placeholder, setPlaceholder] = useState(-1);

  useEffect(() => {
    axios
      .get('http://localhost:5000/')
      .then((res) => {
        setPlaceholder(res.data.result);
      })
      .catch((err) => {
        setPlaceholder(err);
      });
  }, []);

  return (
    <div className="app__wrapper">
      <img src={logo} className="app__logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a className="app__link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
        Learn React
      </a>
      <p>Flask says: {placeholder}</p>
      <Alert variant="light">BootstrapJS Alert.</Alert>
    </div>
  );
}

export default App;
