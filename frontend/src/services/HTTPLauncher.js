const axios = require('axios');
const authHeader = require('./auth-header');

const API_URL = 'http://localhost:5000/';
axios.defaults.adapter = require('axios/lib/adapters/http');

axios.defaults.baseURL = 'http://localhost:5000';

class HTTPLauncher {
  // Send HTTP-request to register a user
  static sendRegister(firstName, lastName, email, password, admin) {
    return axios.post(`${API_URL}register`, {
      first_name: firstName,
      last_name: lastName,
      password,
      email,
      admin,
    });
  }

  // Send HTTP-request to login a user
  static sendLogin(email, password) {
    return axios.post(`${API_URL}login`, {
      email,
      password,
    });
  }

  // Send HTTP-request to refresh an access token
  static sendRefreshToken() {
    return axios.post(`${API_URL}login`, {
      headers: authHeader(),
    });
  }

  // Send HTTP-request to authorize a user to a project
  static sendAuthorizeUser(projectID, email) {
    return axios.post(`${API_URL}authorize-user`, {
      headers: authHeader(),
      project_id: projectID,
      email,
    });
  }

  // Send HTTP-request to deauthorize a user from a project
  static sendDeauthorizeUser(projectID, email) {
    return axios.post(`${API_URL}deauthorize-user`, {
      headers: authHeader(),
      project_id: projectID,
      email,
    });
  }

  // Send HTTP-request to create a new project
  static sendCreateProject(projectName, projectType) {
    return axios.post(`${API_URL}create-project`, {
      headers: authHeader(),
      project_name: projectName,
      project_type: projectType,
    });
  }

  // Send HTTP-request to delete an existing project
  static sendDeleteProject(projectID) {
    return axios.delete(`${API_URL}delete-project`, {
      headers: authHeader(),
      project_id: projectID,
    });
  }

  // Send HTTP-request to add a single datapoint to an existing project
  static sendAddNewData(projectID, projectType, data) {
    return axios.post(`${API_URL}add-data`, {
      headers: authHeader(),
      project_id: projectID,
      project_type: projectType,
      data,
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(projectID, amount = 1) {
    return axios.get(`${API_URL}get-data`, {
      headers: authHeader(),
      project_id: projectID,
      amount,
    });
  }

  // Send HTTP-request to label a datapoint
  static sendCreateLabel(dataID, label) {
    return axios.post(`${API_URL}label-text`, {
      headers: authHeader(),
      data_id: dataID,
      label,
    });
  }

  // Send HTTP-request to remove a label
  static sendRemoveLabel(labelID) {
    return axios.delete(`${API_URL}label-text`, {
      headers: authHeader(),
      label_id: labelID,
    });
  }

  // Send HTTP-request to upload a file
  static sendUploadFile(projectID, path) {
    return 'Not implemented in HTTPLauncher';
  }

  // Send HTTP-request to get data to be exported
  static sendGetExportData(projectID, filters) {
    const params = new URLSearchParams();
    params.append('headers', authHeader());
    params.append('project_id', projectID);

    filters.forEach((element) => {
      params.append('filter', element);
    });

    return axios.get(`${API_URL}get-export-data`, { params });
  }
}

module.exports = HTTPLauncher;
