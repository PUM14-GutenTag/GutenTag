import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

import CreateProject from '../components/CreateProject';
import ChangePass from '../components/ChangePass';
import ManageUsers from '../components/ManageUsers';
import AchievementCarousel from '../components/AchievementCarousel';
import Layout from '../components/Layout';

import { useUser } from '../contexts/UserContext';

import SettingPages from '../SettingPages';

import '../css/settings.css';

/**
 * Page for user and admin settings. Users can from this page log out, view
 * personal records and change password. Admin can additionally from this page add
 * a new project and manage users.
 */
const Settings = () => {
  const [showPage, setPageShow] = useState(SettingPages.DEFAULT);
  const { state: userState } = useUser();

  // Sets the accesstoken to null and redirects to login page.
  const logout = () => {
    localStorage.setItem('gutentag-accesstoken', null);
    localStorage.setItem('gutentag-refreshtoken', null);
    window.location.href = 'http://localhost:3000/';
  };

  const toggleBack = () => {
    setPageShow(SettingPages.DEFAULT);
  };

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
        <h1>Name: {userState.name}</h1>
        <br />
        <h1>Personal records</h1>
        <div style={{ height: '100%', width: '90%' }}>
          <AchievementCarousel />
        </div>
        <br />
        {userState.isAdmin && (
          <Row id="manage-btn-row">
            <Button className="generic" onClick={() => setPageShow(SettingPages.ADD_NEW_PROJECT)}>
              Add new project
            </Button>
            <Button className="generic" onClick={() => setPageShow(SettingPages.MANAGE_USERS)}>
              Manage users
            </Button>
          </Row>
        )}
        <Row id="account-btn-row">
          <Button id="logoutbtn" className="red" onClick={logout}>
            Log out
          </Button>
          <Button className="pass" onClick={() => setPageShow(SettingPages.CHANGE_PASSWORD)}>
            Change password
          </Button>
        </Row>
      </Col>
    </div>,
    <div>
      <Button className="dark" onClick={() => setPageShow(SettingPages.DEFAULT)}>
        Back
      </Button>
      <ChangePass toggleCallback={toggleBack} />
    </div>,
    <div>
      <Button className="dark" onClick={() => setPageShow(SettingPages.DEFAULT)}>
        Back
      </Button>
      <CreateProject />
    </div>,
    <div>
      <ManageUsers toggleCallback={toggleBack} />
    </div>,
  ];

  return <Layout title="Settings">{pages[showPage]}</Layout>;
};

export default Settings;
