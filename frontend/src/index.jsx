import React from 'react';
import ReactDOM from 'react-dom';
import HTTPLauncher from './services/HTTPLauncher';
// Components
import App from './components/App';

const axios = require('axios');

// Render app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const {
      config,
      response: { status },
    } = error;

    const originalRequest = config;

    if (status === 401 && !originalRequest.url.includes('refresh-token')) {
      const response = await HTTPLauncher.sendRefreshToken();
      if (response.status === 200) {
        localStorage.setItem('gutentag-accesstoken', response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return axios.request(originalRequest);
      }
      localStorage.removeItem('gutentag-accesstoken');
    }

    return error;
  }
);
