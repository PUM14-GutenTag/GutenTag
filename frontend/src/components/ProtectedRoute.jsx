/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { propTypes } from 'react-bootstrap/esm/Image';
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

ProtectedRoute.propTypes = {
  component: propTypes.func.isRequired,
  location: propTypes.func.isRequired,
};

export default ProtectedRoute;
