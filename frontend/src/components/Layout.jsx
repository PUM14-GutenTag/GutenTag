import React from 'react';
import PropTypes from 'prop-types';

import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/global.css';

// Default page layout. The content is sandwiches by a header and footer.
const Layout = ({ children }) => (
  <div>
    <Helmet>
      <title>GutenTag</title>
    </Helmet>
    <Header />
    {children}
    <Footer />
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
