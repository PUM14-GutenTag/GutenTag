import React from 'react';

import '../css/Header.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import { NavLink } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import logo from '../res/hat_dark.svg';
/**
 * Header to be used across all pages.
 * TODO: Add content!
 */

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <a className="navbar-brand" href="/">
        <img src={logo} alt="logo" style={{ width: 100, height: 100 }} />
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarToggler"
        aria-controls="navbarToggler"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarToggler">
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          <li className="nav-item">
            <a className="nav-link" href="home">
              Home
              <span className="sr-only">(current)</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="projects">
              Projects
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="settings">
              Settings
            </a>
          </li>
        </ul>
        <ProgressBar bgcolor="#6a1b9a" completed="60" />
      </div>
    </nav>
  );
};

export default Header;
