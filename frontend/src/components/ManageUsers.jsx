import React, { useState, useEffect } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trash } from 'react-bootstrap-icons';

import HTTPLauncher from '../services/HTTPLauncher';
import { useUser } from '../contexts/UserContext';
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
  const { state: userState } = useUser();

  const handleClose = () => setShowWarning(false);
  const handleShow = (user) => {
    setShowWarning(true);
    setUserRemove(user.email);
  };

  // Fetches all users from beckend and sorts them in an array.
  const fetchData = async () => {
    const result = await HTTPLauncher.sendGetUsers();
    if (typeof result.status !== 'undefined' && result.status === 200) {
      const dataArray = Object.values(result.data.users);
      // const mapedDataArray = dataArray.map((userObject) => Object.values(userObject));
      dataArray.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      setUsers(dataArray);
    }
  };

  useEffect(() => {
    if (showUsers) {
      fetchData();
    }
  }, [showUsers]);

  const toggleUsers = () => {
    setShowUsers((previousValue) => !previousValue);
  };

  // Filters users based on input.
  const filterFunc = (user) => {
    return (
      user.name.toUpperCase().indexOf(filter.toUpperCase()) > -1 ||
      user.email.toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  // Sends request to backend to remove user.
  const removeUser = async () => {
    await HTTPLauncher.sendDeleteUser(userRemove);
    fetchData();
    handleClose();
  };

  if (showUsers) {
    return (
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
                <tr key={result.email}>
                  <td>{result.name}</td>
                  <td>{result.email}</td>
                  <td>{result.admin === 5 ? 'yes' : 'no'}</td>
                  <td className="right">
                    {userState.email !== result.email && (
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
    );
  }
  return (
    <div>
      <Button className="dark" onClick={toggleUsers}>
        Back
      </Button>
      <AddUser toggleBack={toggleUsers} />
    </div>
  );
};

ManageUsers.propTypes = {
  toggleCallback: PropTypes.func.isRequired,
};

export default ManageUsers;
