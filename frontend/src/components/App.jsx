import React, { useEffect, useState } from 'react';
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
import AchievementToast from './AchievementToast';

// Styles
import '../css/App.css';
import '../css/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Axios
const axios = require('axios');

const achievementURLs = [
  'login',
  'create-project',
  'add-text-data',
  'add-image-data',
  'label-document',
  'label-sequence',
  'label-sequence-to-sequence',
  'label-image',
  'get-export-data',
];

// App content.
const App = () => {
  const [newAchievements, setNewAchievements] = useState([]);

  // Display popup for each new achievement.
  const displayAchievements = async (response) => {
    if (achievementURLs.includes(response.config.url)) {
      const achieveResponse = await HTTPLauncher.sendGetUnnotifiedAchievements();

      if (response.status === 200) {
        // Merge arrays rather than overwriting.
        setNewAchievements((previousAch) => [...previousAch, ...achieveResponse.data]);
      }
    }
  };

  // Remove achievement from newAchievements array.
  const removeAchievement = (achievement) => {
    setNewAchievements(newAchievements.filter((item) => item !== achievement));
  };

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => {
        if (response.config.url.includes('login')) {
          const { access_token: accessToken, refresh_token: refreshToken } = response.data;
          userAuth.setAccessToken(accessToken);
          userAuth.setRefreshToken(refreshToken);
        }

        displayAchievements(response);

        return response;
      },
      async (error) => {
        if (typeof error.response === 'undefined') {
          return error;
        }

        const { config, response } = error;
        const originalRequest = config;

        if (response.status === 422) {
          userAuth.clearTokens();
          window.location.reload();
          return response;
        }

        if (response.status === 401 && !originalRequest.url.includes('refresh-token')) {
          const tokenResponse = await HTTPLauncher.sendRefreshToken();
          if (tokenResponse.status === 200) {
            userAuth.setAccessToken(tokenResponse.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${tokenResponse.data.access_token}`;
            return axios.request(originalRequest);
          }
          userAuth.clearTokens();
        }

        return error;
      }
    );
  }, []);

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
      <div className="achievement-toast-container">
        {newAchievements.map((achievement) => (
          <AchievementToast
            achievement={achievement}
            onClose={() => removeAchievement(achievement)}
            key={achievement.name}
          />
        ))}
      </div>
    </UserProvider>
  );
};

export default App;
