/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import Layout from './Layout';

// Checks for token in localstorage
function isLoggedIn() {
  const token = localStorage.getItem('gutentag-accesstoken');
  return token !== 'null' && token !== null;
}

// Protected route wraps content in token validation
const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoggedIn()) {
          return (
            <Layout>
              <Component {...props} />
            </Layout>
          );
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
