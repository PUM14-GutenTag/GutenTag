import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { HouseFill, GearFill } from 'react-bootstrap-icons';
import logo from '../res/hat_dark.svg';
import '../css/header.css';

/**
 * Header to be used across all pages.
 */
function Header() {
  return (
    <Navbar className="sticky-top" expand="md">
      <Container id="navbar-content" className="navbar-container">
        <Navbar.Brand className="logo" as={Link} to="/home">
          <img src={logo} alt="logo" className="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
          <Nav className="m-auto">
            <Nav.Link id="home-link" className="text-label" as={Link} to="/home">
              <HouseFill className="icon-offset" /> Home
            </Nav.Link>
            <Nav.Link id="settings-link" className="text-label" as={Link} to="/settings">
              <GearFill className="icon-offset" /> Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
