import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import HTTPLauncher from '../services/HTTPLauncher';

const ManageUsers = ({ toggleCallback }) => {
  const [showUsers, setShowUsers] = useState(true);
  const [users, setUsers] = useState([]);

  async function fetchData() {
    const result = await HTTPLauncher.sendGetUsers();
    const dataArray = Object.values(result.data.users);
    const mapedDataArray = dataArray.map((userObject) => Object.values(userObject));
    setUsers(mapedDataArray);
  }

  useEffect(() => {
    if (showUsers) {
      fetchData();
    }
  }, [showUsers]);

  return (
    <div>
      <h1>Manage users</h1>
      <ul>
        {users.map((result) => (
          <li key={result}>
            <div>
              email={result[0]} name={result[1]}
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={toggleCallback}>Back</Button>
    </div>
  );
};

ManageUsers.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default ManageUsers;
