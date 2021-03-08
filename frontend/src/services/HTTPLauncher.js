import axios from 'axios';

const API_URL = 'http://localhost:5000/';

export class HTTPLauncher {
  // Send HTTP-request to register a user
  static sendRegister(username, password, email) {
    return axios.post(`${API_URL}register`, {
      username,
      password,
      email,
    });
  }

  // Send HTTP-request to login a user
  static sendLogin(username, password) {
    return axios.post(`${API_URL}login`, {
      username,
      password,
    });
  }

  // Send HTTP-request to authorize a user to a project
  static sendAuthorizeUser(userID, projectID) {
    return axios.post(`${API_URL}authorize-user`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  // Send HTTP-request to deauthorize a user from a project
  static sendDeauthorizeUser(userID, projectID) {
    return axios.post(`${API_URL}deauthorize-user`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  // Send HTTP-request to create a new project
  static sendCreateProject(userID, projectName, projectType) {
    return axios.post(`${API_URL}create-project`, {
      user_id: userID,
      project_name: projectName,
      project_type: projectType,
    });
  }

  // Send HTTP-request to delete an existing project
  static sendDeleteProject(userID, projectID) {
    return axios.delete(`${API_URL}delete-project`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(userID, projectID, amount = 1) {
    return axios.get(`${API_URL}get-data`, {
      user_id: userID,
      project_id: projectID,
      amount,
    });
  }

  // Send HTTP-request to label a datapoint
  static sendCreateLabel(userID, projectID, dataID, label) {
    return axios.post(`${API_URL}label-text`, {
      user_id: userID,
      project_id: projectID,
      data_id: dataID,
      label,
    });
  }

  // Send HTTP-request to remove a label
  static sendRemoveLabel(userID, projectID, dataID) {
    return axios.delete(`${API_URL}label-text`, {
      user_id: userID,
      project_id: projectID,
      data_id: dataID,
    });
  }

  // Send HTTP-request to upload a file
  static sendUploadFile(userID, projectID, path) {
    return 'Not implemented in HTTPLauncher';
  }

  // Send HTTP-request to get data to be exported
  static sendGetExportData(userID, projectID, filters) {
    const params = new URLSearchParams();
    params.append('user_id', userID);
    params.append('project_id', projectID);

    filters.forEach((element) => {
      params.append('filter', element);
    });

    return axios.get(`${API_URL}get-export-data`, { params });
  }
}

export default new HTTPLauncher();
