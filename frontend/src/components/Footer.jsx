import React from 'react';
import { Github } from 'react-bootstrap-icons';
import '../css/footer.css';

/**
 * Footer to be used across all pages.
 */
const Footer = () => {
  return (
    <div className="main-footer">
      <div className="footer-container">
        <div id="content-row" className="row">
          {/* Column 1 */}
          <div className="col">
            <h1>GutenTag</h1>
            <ul className="list-unstyled">
              <li>
                Striving to improve the user experience through making data labeling fun and
                exciting.
              </li>
            </ul>
          </div>
          {/* Column 3 */}
          <div className="col">
            <h1>GitHub</h1>
            <a href="https://github.com/th3tard1sparadox/GutenTag">
              <Github className="github-logo" color="#063954" />
            </a>
          </div>
        </div>

        <hr />

        <div id="copyright-row" className="row">
          <p className="col-small">
            &copy; Copyright {new Date().getFullYear()} GutenTag contributors | All rights reserved
            |{' '}
            <a
              style={{ color: '#063954' }}
              href="https://github.com/th3tard1sparadox/GutenTag/blob/main/LICENSE"
            >
              License
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
