import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CreateProject from '../components/CreateProject';
import ChangePass from '../components/ChangePass';
import ManageUsers from '../components/ManageUsers';
import AchievementCarousel from '../components/AchievementCarousel';
import StatList from '../components/StatList';
import Layout from '../components/Layout';

import { useUser } from '../contexts/UserContext';
import userAuth from '../services/userAuth';

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
  const history = useHistory();

  // Sets the accesstoken to null and redirects to login page.
  const logout = () => {
    userAuth.clearTokens();
    history.push('/');
  };

  const toggleBack = () => {
    setPageShow(SettingPages.DEFAULT);
  };

  const pages = [
    <div>
      <Col className="main-col">
        <h1>{userState.name}</h1>
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
        <h2>Achievements</h2>
        <AchievementCarousel containerClass="carousel-container" />
        <h2>Statistics</h2>
        <StatList />
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
      <CreateProject toggleCallback={toggleBack} />
    </div>,
    <div>
      <ManageUsers toggleCallback={toggleBack} />
    </div>,
  ];

  return <Layout title="Settings">{pages[showPage]}</Layout>;
};

export default Settings;
