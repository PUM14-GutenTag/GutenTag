import React from 'react';
import ReactDOM from 'react-dom';

// Styles
import './css/index.css';
import './css/App.css';

// Components
import App from './components/App';

// Render app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
