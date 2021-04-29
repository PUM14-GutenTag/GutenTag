import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import HTTPLauncher from '../services/HTTPLauncher';
import userAuth from '../services/userAuth';

// Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import NotFound from '../pages/404';
import Login from '../pages/Login';
import Labeling from '../pages/Labeling';
import EditProject from '../pages/EditProject';

// Components
import ProtectedRoute from './ProtectedRoute';
import { UserProvider } from '../contexts/UserContext';

// Styles
import '../css/App.css';
import '../css/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Axios
const axios = require('axios');

// App content.
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <ProtectedRoute exact path="/labeling" component={Labeling} />
          <ProtectedRoute exact path="/home" component={Home} />
          <ProtectedRoute exact path="/settings" component={Settings} />
          <ProtectedRoute exact path="/edit-project" component={EditProject} />
          <Route exact path="/404" component={NotFound} />
          <Redirect to="/404" />
        </Switch>
      </Router>
    </UserProvider>
  );
};

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
      userAuth.clearTokens();
    }

    return error;
  }
);

export default App;
