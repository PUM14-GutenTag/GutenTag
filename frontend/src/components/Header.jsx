import React from 'react';

import '../css/Header.css';
import { Navbar, Nav } from 'react-bootstrap';

import logo from '../res/hat_dark.svg';
/**
 * Header to be used across all pages.
 */

function Header() {
  return (
    <Navbar className="sticky-top" expand="md">
      <Nav className="navbar-container">
        <Navbar.Brand className="logo" href="https://github.com/th3tard1sparadox/GutenTag">
          <img src={logo} alt="logo" className="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
          <Nav className="m-auto">
            <Nav.Link className="text-label" href="home">
              Home
            </Nav.Link>
            <Nav.Link className="text-label" href="projects">
              Projects
            </Nav.Link>
            <Nav.Link className="text-label" href="settings">
              Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Nav>
    </Navbar>
  );
}

export default Header;
