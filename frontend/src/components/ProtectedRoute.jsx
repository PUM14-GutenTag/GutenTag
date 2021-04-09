/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import Layout from './Layout';

// Checks for token in localstorage
function isLoggedIn() {
  const token = localStorage.getItem('gutentag-accesstoken');
  if (token !== 'null') {
    return true;
  }
  return false;
}

// Protected route wraps content in token validation
// eslint-disable-next-line react/prop-types
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
                // eslint-disable-next-line react/prop-types
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
