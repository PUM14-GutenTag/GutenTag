import React from 'react';
import { HouseFill, GearFill } from 'react-bootstrap-icons';

import '../css/Header.css';
import { Navbar, Nav, Container } from 'react-bootstrap';

import logo from '../res/hat_dark.svg';
/**
 * Header to be used across all pages.
 */

function Header() {
  return (
    <Navbar className="sticky-top" expand="md">
      <Container className="navbar-container">
        <Navbar.Brand className="logo" href="https://github.com/th3tard1sparadox/GutenTag">
          <img src={logo} alt="logo" className="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
          <Nav className="m-auto">
            <Nav.Link className="text-label" href="http://localhost:3000/home">
              <HouseFill className="icon-offset" /> Home
            </Nav.Link>

            <Nav.Link className="text-label" href="http://localhost:3000/settings">
              <GearFill className="icon-offset" /> Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
