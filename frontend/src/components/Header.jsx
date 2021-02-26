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
const Header = () => (
  <Navbar bg="dark" variant="dark" className="">
    <Nav.Link href="home">Home</Nav.Link>
    <Nav.Link href="projects">Projects</Nav.Link>
    <Nav.Link href="settings">Settings</Nav.Link>
    <Navbar.Text>Daily progress:</Navbar.Text>
    <ProgressBar bgcolor="#6a1b9a" completed="60" />
    <Navbar.Brand href="https://github.com/th3tard1sparadox/GutenTag">
      <img src={logo} alt="logo" style={{ width: 100, height: 100 }} />
    </Navbar.Brand>
  </Navbar>
);

export default Header;
