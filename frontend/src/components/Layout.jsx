import React from 'react';
import PropTypes from 'prop-types';

import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';

// Default page layout. The content is sandwiched by a header and footer.
const Layout = ({ children, title }) => (
  <>
    <Helmet>
      <title>{`GutenTag${title == null ? '' : ` | ${title}`}`}</title>
    </Helmet>
    <Header />
    <article>
      <div className="page-container">
        <div className="content-wrap">{children}</div>
      </div>
    </article>
    <Footer />
  </>
);
Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};
Layout.defaultProps = {
  title: null,
};

export default Layout;
