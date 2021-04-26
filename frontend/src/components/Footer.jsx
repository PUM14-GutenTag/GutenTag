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
          {/* Column 2 */}
          <div className="col">
            <h1>Stories</h1>
            <ul className="list-unstyled">
              <li>Here we could add some challenges left to do. For example:</li>
              <br />
              <li>Label 30 objects in a day:</li>
              <li>9/10 [insert progress bar]</li>
              <br />
              <li>Label 200 images: </li>
              <li>134/200 [insert progress bar]</li>
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
            &copy; Copyright {new Date().getFullYear()} GutenTag | All rights reserved | Terms of
            Service | Privacy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
