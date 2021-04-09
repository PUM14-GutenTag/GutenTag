import React from 'react';

import '../css/Header.css';
import { Navbar, Nav } from 'react-bootstrap';

import logo from '../res/hat_dark.svg';
/**
 * Header to be used across all pages.
 */

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <Navbar.Brand href="https://github.com/th3tard1sparadox/GutenTag">
        <img src={logo} alt="logo" className="logo" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
        <Nav className="justify-content-center">
          <Nav.Item>
            <Nav.Link className="text-label" href="home">
              Home
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className="text-label" href="projects">
              Projects
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className="text-label" href="settings">
              Settings
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
