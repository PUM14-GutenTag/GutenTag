import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Check, Trash } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';

import '../css/editProject.css';

const ManageProjectUsers = ({ projectID }) => {
  const [showUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchUserData = async () => {
    const result = await HTTPLauncher.sendGetUsers();
    const dataArray = Object.values(result.data.users);
    const mapedDataArray = dataArray.map((userObject) => Object.values(userObject));
    mapedDataArray.sort((a, b) => {
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
    setUsers(mapedDataArray);
  };

  const filterFunc = (u) => {
    return (
      u[2].toUpperCase().indexOf(filter.toUpperCase()) > -1 ||
      u[1].toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  useEffect(() => {
    if (showUsers) {
      fetchUserData();
    }
  }, [showUsers]);

  const removeUser = async (u) => {
    await HTTPLauncher.sendDeauthorizeUser(projectID, u);
    fetchUserData();
  };

  const addUser = async (u) => {
    console.log(projectID + u);
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
          </tr>
        </thead>
        <tbody>
          {users
            .filter((u) => filterFunc(u))
            .map((result) => (
              <tr key={result}>
                <td>{result[2]}</td>
                <td>{result[1]}</td>
                <td>
                  <Check className="add" onClick={() => addUser(result[1])} />
                </td>
                <td>
                  <Trash className="remove" onClick={() => removeUser(result[1])} />
                </td>
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
