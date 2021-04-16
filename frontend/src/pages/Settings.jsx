import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import CreateProject from '../components/CreateProject';
import ChangePass from '../components/ChangePass';
import HTTPLauncher from '../services/HTTPLauncher';

import '../css/settings.css';

const Settings = () => {
  const [showPage, setPageShow] = useState(0);
  const [name, setName] = useState('');

  async function fetchName() {
    return 'John Doe';
  }

  useEffect(() => {
    if (showPage === 0) {
      fetchName().then((n) => setName(n));
    }
  }, [showPage]);

  const logout = () => {
    localStorage.setItem('gutentag-accesstoken', null);
    window.location.href = 'http://localhost:3000/';
  };

  const toggleBack = () => {
    setPageShow(0);
  };

  // 0: default page
  // 1: Change password
  // 2: Add new project
  // 3: Manage projects
  // 4: Manage users
  const pages = [
    <div>
      <Col
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>Name: {name}</h1>
        <h1>Personal records</h1>
        <Row id="manage-btn-row">
          <Button className="generic" onClick={() => setPageShow(2)}>
            Add new project
          </Button>
          <Button className="generic" onClick={() => setPageShow(3)}>
            Manage projects
          </Button>
          <Button className="generic" onClick={() => setPageShow(4)}>
            Manage users
          </Button>
        </Row>
        <Row id="account-btn-row">
          <Button id="logoutbtn" className="logout" onClick={logout}>
            Log out
          </Button>
          <Button className="pass" onClick={() => setPageShow(1)}>
            Change password
          </Button>
        </Row>
      </Col>
    </div>,
    <div>
      <ChangePass />
    </div>,
    <div>
      <CreateProject toggleCallback={toggleBack} />
    </div>,
    <div />,
    <div />,
  ];

  return pages[showPage];
};

export default Settings;
