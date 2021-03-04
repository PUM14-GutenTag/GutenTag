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

<<<<<<< HEAD
function Header(){ 

  return (
  <Navbar className="navbar-container" bg="dark" variant="dark" expand="lg">
    <Navbar.Brand href="https://github.com/th3tard1sparadox/GutenTag">
      <img src={logo} alt="logo" style={{ width: 100, height: 100 }} />
      </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
      <Nav.Link href="home">Home</Nav.Link>
      <Nav.Link href="projects" >Projects</Nav.Link>
      <Nav.Link href="settings" >Settings</Nav.Link>
    </Navbar.Collapse>
    <Navbar.Text lg="6" className="d-none d-lg-block">Daily progress:</Navbar.Text>
    <ProgressBar bgcolor="#6a1b9a" completed="60"/>
  </Navbar>
  );
}
=======
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
>>>>>>> a73c390453eb437b3790ebf0987f8fc1fa67ff18

export default Header;
