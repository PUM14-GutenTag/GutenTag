import React from 'react';
import PropTypes from 'prop-types';

import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/global.css';
import '../css/App.css';

// Default page layout. The content is sandwiches by a header and footer.
const Layout = ({ children }) => (
  <>
    <Helmet>
      <title>GutenTag</title>
    </Helmet>
    <Header />
    <div className="page-container">
      <div className="content-wrap">{children}</div>
    </div>
    <Footer />
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
