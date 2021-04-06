const axios = require('axios');
const authHeader = require('./auth-header');

const apiUrl = 'http://backend:5000/';

class HTTPLauncher {
  // Send HTTP-request to register a user.
  static sendRegister(firstName, lastName, password, email, admin) {
    return axios.post(`${apiUrl}register`, {
      first_name: firstName,
      last_name: lastName,
      password,
      email,
      admin,
    });
  }

  // Send HTTP-request to login a user.
  static sendLogin(email, password) {
    return axios.post(`${apiUrl}login`, {
      email,
      password,
    });
  }

  // Send HTTP-request to refresh an access token.
  static sendRefreshToken() {
    console.log(authHeader(true));
    return axios.post(`${apiUrl}refresh-token`, {
      headers: authHeader(true),
    });
  }

  // Send HTTP-request to authorize a user to a project.
  static sendAuthorizeUser(projectID, email) {
    return axios.post(`${apiUrl}authorize-user`, {
      headers: authHeader(),
      project_id: projectID,
      email,
    });
  }

  // Send HTTP-request to deauthorize a user from a project.
  static sendDeauthorizeUser(projectID, email) {
    return axios.post(`${apiUrl}deauthorize-user`, {
      headers: authHeader(),
      project_id: projectID,
      email,
    });
  }

  // Send HTTP-request to create a new project.
  static sendCreateProject(projectName, projectType) {
    return axios.post(`${apiUrl}create-project`, {
      headers: authHeader(),
      project_name: projectName,
      project_type: projectType,
    });
  }

  // Send HTTP-request to delete an existing project.
  static sendDeleteProject(projectID) {
    return axios.delete(`${apiUrl}delete-project`, {
      headers: authHeader(),
      project_id: projectID,
    });
  }

  // Send HTTP-request to add one or more text data points to an existing project.
  static sendAddNewTextData(projectID, projectType, JsonData) {
    return axios.post(`${apiUrl}add-text-data`, {
      headers: authHeader(),
      project_id: projectID,
      project_type: projectType,
      json_data: JsonData,
    });
  }

  // Send HTTP-request to add one or more text data points to an existing project.
  static sendAddNewImageData(projectID, projectType, JsonData, images) {
    const formData = new FormData();
    formData.append('images', images);
    return axios.post(`${apiUrl}add-image-data`, formData, {
      headers: { 'Content-type': 'multipart/form-data', ...authHeader() },
      project_id: projectID,
      project_type: projectType,
      json_data: JsonData,
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(projectID, amount = 1) {
    return axios.get(`${apiUrl}get-data`, {
      headers: authHeader(),
      project_id: projectID,
      amount,
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateDocumentClassificationLabel(dataID, label) {
    return axios.post(`${apiUrl}label-document`, {
      headers: authHeader(),
      data_id: dataID,
      label,
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateSequenceLabel(dataID, label, begin, end) {
    return axios.post(`${apiUrl}label-sequence`, {
      headers: authHeader(),
      data_id: dataID,
      label,
      begin,
      end,
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateSequenceToSequenceLabel(dataID, label) {
    return axios.post(`${apiUrl}label-sequence-to-sequence`, {
      headers: authHeader(),
      data_id: dataID,
      label,
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateImageClassificationLabel(dataID, label, x1, y1, x2, y2) {
    return axios.post(`${apiUrl}label-image`, {
      headers: authHeader(),
      data_id: dataID,
      label,
      x1,
      y1,
      x2,
      y2,
    });
  }

  // Send HTTP-request to remove a label.
  static sendRemoveLabel(labelID) {
    return axios.delete(`${apiUrl}label-text`, {
      headers: authHeader(),
      label_id: labelID,
    });
  }

  // Send HTTP-request to get data to be exported.
  static sendGetExportData(projectID, filters) {
    const params = new URLSearchParams();
    params.append('headers', authHeader());
    params.append('project_id', projectID);

    filters.forEach((element) => {
      params.append('filter', element);
    });

    return axios.get(`${apiUrl}get-export-data`, { params });
  }

  // Send HTTP-request to reset database (TODO: remove for production).
  static sendResetDatabase() {
    return axios.get(`${apiUrl}reset`);
  }
}

module.exports = HTTPLauncher;
