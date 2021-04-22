import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

import CreateProject from '../components/CreateProject';
import ChangePass from '../components/ChangePass';
import ManageUsers from '../components/ManageUsers';
import AchievementCarousel from '../components/AchievementCarousel';

import HTTPLauncher from '../services/HTTPLauncher';

import '../css/settings.css';

/**
 * Page for user and admin settings. Users can from this page log out, view
 * personal records and change password. Admin can additionally from this page add
 * a new project and manage users.
 */
const Settings = () => {
  const [showPage, setPageShow] = useState(0);
  const [name, setName] = useState('');

  // Fetches the logged in users name from backend.
  const fetchName = async () => {
    const response = await HTTPLauncher.sendGetUserName();
    return response.data.name;
  };

  useEffect(() => {
    if (showPage === 0) {
      fetchName().then((n) => setName(n));
    }
  }, [showPage]);

  // Sets the accesstoken to null and redirects to login page.
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
  // 3: Manage users
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
        <br />
        <h1>Personal records</h1>
        <div style={{ height: '100%', width: '90%' }}>
          <AchievementCarousel />
        </div>
        <br />
        <Row id="manage-btn-row">
          <Button className="generic" onClick={() => setPageShow(2)}>
            Add new project
          </Button>
          <Button className="generic" onClick={() => setPageShow(3)}>
            Manage users
          </Button>
        </Row>
        <Row id="account-btn-row">
          <Button id="logoutbtn" className="red" onClick={logout}>
            Log out
          </Button>
          <Button className="pass" onClick={() => setPageShow(1)}>
            Change password
          </Button>
        </Row>
      </Col>
    </div>,
    <div>
      <Button className="dark" onClick={() => setPageShow(0)}>
        Back
      </Button>
      <ChangePass toggleCallback={toggleBack} />
    </div>,
    <div>
      <Button className="dark" onClick={() => setPageShow(0)}>
        Back
      </Button>
      <CreateProject toggleCallback={toggleBack} />
    </div>,
    <div>
      <ManageUsers toggleCallback={toggleBack} />
    </div>,
  ];

  return pages[showPage];
};

export default Settings;
