import authHeader from "./auth-header";
const axios = require('axios');
//const authHeader = require('./auth-header');

const apiUrl = 'http://localhost:5000/';

class HTTPLauncher {
  // Send HTTP-request to register a user
  static sendRegister(firstName, lastName, email, password, admin) {
    return axios.post(`${apiUrl}register`, {
      first_name: firstName,
      last_name: lastName,
      password,
      email,
      admin,
    });
  }

  // Send HTTP-request to login a user
  static sendLogin(email, password) {
    return axios.post(`${apiUrl}login`, {
      email,
      password,
    });
  }

  // Send HTTP-request to refresh an access token
  static sendRefreshToken() {
    return axios.post(`${apiUrl}login`, {
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to authorize a user to a project
  static sendAuthorizeUser(projectID, email) {
    return axios.post(`${apiUrl}authorize-user`, {
      project_id: projectID,
      email,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to deauthorize a user from a project
  static sendDeauthorizeUser(projectID, email) {
    return axios.post(`${apiUrl}deauthorize-user`, {
      project_id: projectID,
      email,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to create a new project
  static sendCreateProject(projectName, projectType) {

    console.log("Accesstoken:", localStorage.getItem('gutentag-accesstoken'))
    return axios.post(`${apiUrl}create-project`, { 
      project_name: projectName,
      project_type: projectType,
    }, {
      headers: authHeader()
    });
  }
  

  // Send HTTP-request to delete an existing project
  static sendDeleteProject(projectID) {
    return axios.delete(`${apiUrl}delete-project`, {
      project_id: projectID,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to add a single datapoint to an existing project
  static sendAddNewData(projectID, projectType, data) {
    return axios.post(`${apiUrl}add-data`, {
      project_id: projectID,
      project_type: projectType,
      data,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(projectID, amount = 1) {
    return axios.get(`${apiUrl}get-data`, {
      project_id: projectID,
      amount,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to label a datapoint
  static sendCreateLabel(dataID, label) {
    return axios.post(`${apiUrl}label-text`, {
      data_id: dataID,
      label,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to remove a label
  static sendRemoveLabel(labelID) {
    return axios.delete(`${apiUrl}label-text`, {
      label_id: labelID,
    }, {
      headers: authHeader()
    });
  }

  // Send HTTP-request to get data to be exported
  static sendGetExportData(projectID, filters) {
    const params = new URLSearchParams();
    params.append('project_id', projectID);

    filters.forEach((element) => {
      params.append('filter', element);
    });

    return axios.get(`${apiUrl}get-export-data`, { params }, {
      headers: authHeader()
    });
  }
}


export default HTTPLauncher;
