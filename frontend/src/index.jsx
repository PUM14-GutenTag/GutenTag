import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';

import Layout from './components/Layout';
import App from './components/App';

ReactDOM.render(
  <Layout>
    <App />
  </Layout>,
  document.getElementById('root')
);
