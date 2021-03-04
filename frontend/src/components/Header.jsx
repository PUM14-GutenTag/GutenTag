import React from 'react';

import '../css/Header.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import ProgressBar from './ProgressBar';
import logo from '../res/hat_dark.svg';
/**
 * Header to be used across all pages.
 * TODO: Add content!
 */

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

export default Header;
