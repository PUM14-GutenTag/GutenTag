import React, { useState, useEffect } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trash } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';

import AddUser from './AddUser';

/**
 * Component for admin to manage users. Admin can add a new user and delete
 * existing users.
 */
const ManageUsers = ({ toggleCallback }) => {
  const [showUsers, setShowUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [userRemove, setUserRemove] = useState('');
  const [userName, setUserName] = useState('');

  const handleClose = () => setShowWarning(false);
  const handleShow = (u) => {
    setShowWarning(true);
    setUserRemove(u[1]);
  };

  // Fetches the logged in users name from backend.
  const fetchName = async () => {
    const response = await HTTPLauncher.sendGetUserName();
    return response.data.name;
  };

  // Fetches all users from beckend and sorts them in an array.
  const fetchData = async () => {
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

  useEffect(() => {
    if (showUsers) {
      fetchData();
      fetchName().then((n) => setUserName(n));
    }
  }, [showUsers]);

  const toggleUsers = () => {
    setShowUsers((previousValue) => !previousValue);
  };

  // Filters users based on input.
  const filterFunc = (u) => {
    return (
      u[2].toUpperCase().indexOf(filter.toUpperCase()) > -1 ||
      u[1].toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  // Sends request to backend to remove user.
  const removeUser = async () => {
    await HTTPLauncher.sendDeleteUser(userRemove);
    fetchData();
    handleClose();
  };

  return (
    <div>
      {showUsers ? (
        <div>
          <Button className="dark" id="button-margin" onClick={toggleCallback}>
            Back
          </Button>
          <Button className="dark" onClick={toggleUsers}>
            Add user
          </Button>
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
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => filterFunc(u))
                .map((result) => (
                  <tr key={result}>
                    <td>{result[2]}</td>
                    <td>{result[1]}</td>
                    <td>{result[0] === 5 ? 'yes' : 'no'}</td>
                    <td className="right">
                      {userName !== result[2] && (
                        <Trash className="remove" onClick={() => handleShow(result)} />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <Modal show={showWarning} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete {userRemove}?</Modal.Body>
            <Modal.Footer>
              <Button className="dark" id="small" onClick={handleClose}>
                No
              </Button>
              <Button className="red" id="small" onClick={removeUser}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div>
          <Button className="dark" onClick={toggleUsers}>
            Back
          </Button>
          <AddUser toggleBack={toggleUsers} />
        </div>
      )}
    </div>
  );
};

ManageUsers.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default ManageUsers;
