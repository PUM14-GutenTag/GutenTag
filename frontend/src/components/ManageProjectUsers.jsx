import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';
import { Check, X } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';

import '../css/editProject.css';

// Component for making users authorized and deauthorized to projects.
// Only accessable as admin.
const ManageProjectUsers = ({ projectID }) => {
  const [showUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [projectUsers, setProjectUsers] = useState([]);

  // Fetches all users authorized to the project.
  const fetchProjectUsersData = async () => {
    const result = await HTTPLauncher.sendGetProjectUsers(projectID);
    const dataArray = Object.values(result.data.users);
    setProjectUsers(dataArray);
  };

  // Fetches all users.
  const fetchUserData = async () => {
    const result = await HTTPLauncher.sendGetUsers();
    const dataArray = Object.values(result.data.users);
    const mappedDataArray = dataArray.map((userObject) => Object.values(userObject));
    mappedDataArray.sort((a, b) => {
      const nameA = a[2].toUpperCase();
      const nameB = b[2].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    setUsers(mappedDataArray);
    fetchProjectUsersData();
  };

  // Filters users based on name, email and accesslevel.
  const filterFunc = (u) => {
    return (
      (u[2].toUpperCase().indexOf(filter.toUpperCase()) > -1 ||
        u[1].toUpperCase().indexOf(filter.toUpperCase()) > -1) &&
      u[0] !== 5
    );
  };

  // Filters users based on if they are authorized to the project.
  const filterProjectUsers = (u) => {
    return projectUsers.includes(u[1]);
  };

  useEffect(() => {
    if (showUsers) {
      fetchUserData();
    }
  }, [showUsers]);

  // Sends request to backend to deauthorize user.
  const deauthorizeUser = async (u) => {
    await HTTPLauncher.sendDeauthorizeUser(projectID, u);
    fetchUserData();
  };

  // Sends request to backend to authorize a user.
  const authorizeUser = async (u) => {
    await HTTPLauncher.sendAuthorizeUser(projectID, u);
    fetchUserData();
  };

  return (
    <div>
      <br />
      <h1>Add users to project</h1>
      <br />
      <input
        className="text"
        type="text"
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
        placeholder="Search for users..."
      />
      <Table className="users-table" striped borderless hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th className="right">Authorized</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((u) => filterFunc(u))
            .map((result) => (
              <tr key={result}>
                <td>{result[2]}</td>
                <td>{result[1]}</td>

                {filterProjectUsers(result) ? (
                  <td className="right">
                    <Check className="add" onClick={() => deauthorizeUser(result[1])} />
                  </td>
                ) : (
                  <td className="right">
                    <X className="remove" onClick={() => authorizeUser(result[1])} />
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );
};

ManageProjectUsers.propTypes = {
  projectID: PropTypes.number.isRequired,
};

export default ManageProjectUsers;
