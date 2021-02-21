import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';

import Layout from './components/Layout';
import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>,
  document.getElementById('root')
);
