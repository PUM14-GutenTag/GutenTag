/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';

import { useUser } from '../contexts/UserContext';
import HTTPLauncher from '../services/HTTPLauncher';
import userAuth from '../services/userAuth';

// Get user info from backend and store it in global user context.
// Redirects user to login if not logged in.
const getUserInfo = async (dispatch, history) => {
  const response = await HTTPLauncher.sendGetUserInfo().catch((e) => {
    if (typeof e.response.status === 'undefined' || e.response.status === 401) {
      history.push('/login');
    }
  });

  if (response) {
    if (Object.prototype.hasOwnProperty.call(response, 'data')) {
      dispatch({
        type: 'SET_USER_INFO',
        value: {
          name: response.data.name,
          email: response.data.email,
          isAdmin: response.data.access_level >= 5,
        },
      });
    }
  }
};

// Protected route wraps content in token validation
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { dispatch: userDispatch } = useUser();
  const history = useHistory();

  useEffect(() => {
    getUserInfo(userDispatch, history);
  }, [userDispatch, history]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (userAuth.hasAccessToken()) {
          return <Component {...props} />;
        }
        return (
          <Redirect
            to={{
              pathname: '/',
              state: {
                from: props.location,
              },
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedRoute;
