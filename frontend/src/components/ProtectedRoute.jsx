/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';

import { useUser } from '../contexts/UserContext';
import HTTPLauncher from '../services/HTTPLauncher';

// Checks for token in localstorage
const isLoggedIn = () => {
  const token = localStorage.getItem('gutentag-accesstoken');
  return token !== 'null' && token !== null;
};

// Get user info from backend and store it in global user context.
const getUserInfo = async (dispatch) => {
  const response = await HTTPLauncher.sendGetUserInfo();
  console.log({ response });
  dispatch({
    type: 'SET_USER_INFO',
    value: {
      name: response.data.name,
      email: response.data.email,
      isAdmin: response.data.access_level >= 5,
    },
  });
};

// Protected route wraps content in token validation
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { dispatch: userDispatch } = useUser();

  useEffect(() => {
    getUserInfo(userDispatch);
  }, [userDispatch]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoggedIn()) {
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
