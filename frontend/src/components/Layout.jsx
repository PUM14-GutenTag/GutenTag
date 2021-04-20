import React from 'react';
import PropTypes from 'prop-types';

import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';
import UserStore from '../stores/UserStore';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/global.css';

// Default page layout. The content is sandwiched by a header and footer.
const Layout = ({ children, title }) => (
  <>
    <Helmet>
      <title>{`GutenTag${title == null ? '' : ` | ${title}`}`}</title>
    </Helmet>
    <UserStore>
      <Header />
      <article>
        <div className="page-container">
          <div className="content-wrap">{children}</div>
        </div>
      </article>
      <Footer />
    </UserStore>
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
