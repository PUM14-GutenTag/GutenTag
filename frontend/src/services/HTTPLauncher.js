import axios from 'axios';

const API_URL = 'http://localhost:5000/';

export class HTTPLauncher {
  static sendRegister(username, password, email) {
    return axios.post(`${API_URL}register`, {
      username,
      password,
      email,
    });
  }

  static sendLogin(username, password) {
    return axios.post(`${API_URL}login`, {
      username,
      password,
    });
  }

  static sendAuthorizeUser(userID, projectID) {
    return axios.post(`${API_URL}authorize-user`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  static sendDeauthorizeUser(userID, projectID) {
    return axios.post(`${API_URL}deauthorize-user`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  static sendCreateProject(userID, projectName, projectType) {
    return axios.post(`${API_URL}create-project`, {
      user_id: userID,
      project_name: projectName,
      project_type: projectType,
    });
  }

  static sendDeleteProject(userID, projectID) {
    return axios.delete(`${API_URL}delete-project`, {
      user_id: userID,
      project_id: projectID,
    });
  }

  // fetches 1 datapoint if nothing is specified
  static sendGetData(userID, projectID, amount = 1) {
    return axios.get(`${API_URL}get-data`, {
      user_id: userID,
      project_id: projectID,
      amount,
    });
  }

  static sendTextLabel(userID, projectID, dataID, label) {
    return axios.post(`${API_URL}label-text`, {
      user_id: userID,
      project_id: projectID,
      data_id: dataID,
      label,
    });
  }

  static sendImageLabel(userID, projectID, dataID, label) {
    return axios.post(`${API_URL}label-image`, {
      user_id: userID,
      project_id: projectID,
      data_id: dataID,
      label,
    });
  }

  static sendRemoveLabel(userID, projectID, dataID) {
    return axios.delete(`${API_URL}label-text`, {
      user_id: userID,
      project_id: projectID,
      data_id: dataID,
    });
  }

  static sendUploadFile(userID, projectID, path) {
    return 'Not implemented in HTTPLauncher';
  }

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
