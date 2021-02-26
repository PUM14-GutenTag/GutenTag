import React from 'react';
import '../css/Footer.css';
import Navbar from 'react-bootstrap/Navbar';
import githublogo from '../res/github-logo.png';

/**
 * Footer to be used across all pages.
 * TODO: Add content!
 */
const Footer = () => {
    return (
        <div className="main-footer">
            <div className="footer-container">
                <div className="row">
                    {/* Column 1 */}
                    <div className="col">
                        <h5>GutenTag</h5>
                        <ul className="list-unstyled">
                        <li>Striving to improve the user</li>
                        <li>experience through making data</li>
                        <li>labeling fun and exciting.</li>
                        </ul>
                    </div>
                    {/* Column 2 */}
                    <div className="col">
                        <h5>Challenges left</h5>
                        <ul className="list-unstyled">
                        <li>Here we could add some challenges left</li>
                        <li>to do. For example:</li>
                        <br/>
                        <li>Label 30 objects in a day:</li>
                        <li>9/10 [insert progress bar]</li>
                        <br/>
                        <li>Label 200 images: </li>
                        <li>134/200 [insert progress bar]</li>
                        </ul>
                    </div>
                    {/* Column 3 */}
                    <div className="col">
                        <h5>GitHub</h5>
                        <Navbar.Brand href="https://github.com/">
                        <img className="logo-position" src={githublogo} style={{ width: 100, height: 100 }} />
                        </Navbar.Brand>
                    </div>
                </div>

                <hr />

                <div className="row">
                <p className="col-small">
                    &copy; Copyright {new Date().getFullYear()} GutenTag | All rights reserved | Terms of Service | Privacy
                </p>
                </div>
            </div>
        </div>
    );
}


export default Footer;
