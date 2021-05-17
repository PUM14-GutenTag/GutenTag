import authHeader from './authHeader';

const axios = require('axios');

axios.defaults.baseURL = 'http://localhost:5000/';
class HTTPLauncher {
  // Sets the base URL for all requests.
  static setBaseURL(URL) {
    axios.defaults.baseURL = URL;
  }

  // Send HTTP-request to create a user
  static sendCreateUser(firstName, lastName, password, email, admin) {
    return axios.post(
      'create-user',
      {
        first_name: firstName,
        last_name: lastName,
        password,
        email,
        admin,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to login a user.
  static sendLogin(email, password) {
    return axios.post('login', {
      email,
      password,
    });
  }

  // Send HTTP-request to change password
  static sendChangePassword(oldPassword, newPassword) {
    return axios.post(
      'change-password',
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        headers: authHeader(),
      }
    );
  }

  static sendChangePasswordOther(email, newPassword) {
    return axios.post(
      'change-password',
      {
        old_password: 'old password',
        new_password: newPassword,
        email,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to refresh an access token.
  static sendRefreshToken() {
    return axios.post(
      'refresh-token',
      {},
      {
        headers: authHeader(true),
      }
    );
  }

  // Send HTTP-request to authorize a user to a project.
  static sendAuthorizeUser(projectID, email) {
    return axios.post(
      'authorize-user',
      {
        project_id: projectID,
        email,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to deauthorize a user from a project.
  static sendDeauthorizeUser(projectID, email) {
    return axios.post(
      'deauthorize-user',
      {
        project_id: projectID,
        email,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to create a new default label.
  static sendCreateDefaultLabel(labelName, projectID) {
    return axios.post(
      'create-default-label',
      {
        label_name: labelName,
        project_id: projectID,
      },
      { headers: authHeader() }
    );
  }

  // Send HTTP-request to create a new project.
  static sendCreateProject(projectName, projectType) {
    return axios.post(
      'create-project',
      {
        project_name: projectName,
        project_type: projectType,
      },
      { headers: authHeader() }
    );
  }

  // Send HTTP-request to delete an existing default label.
  static sendDeleteDefaultLabel(projectID, labelName) {
    return axios.delete('delete-default-label', {
      headers: authHeader(),
      data: {
        project_id: projectID,
        label_name: labelName,
      },
    });
  }

  // Send HTTP-request to delete an existing project.
  static sendDeleteProject(projectID) {
    return axios.delete('delete-project', {
      headers: authHeader(),
      data: { project_id: projectID },
    });
  }

  // Send HTTP-request to delete a user.
  static sendDeleteUser(email) {
    return axios.delete('delete-user', {
      headers: authHeader(),
      params: { email },
    });
  }

  // Send HTTP-request to get the logged in user's info.
  static sendGetUserInfo() {
    return axios.get('get-user-info', {
      headers: authHeader(),
    });
  }

  // Send HTTP-request to get all users info.
  static sendGetUsers() {
    return axios.get('get-users', {
      headers: authHeader(),
    });
  }

  // Send HTTP-request to get all users related to a project.
  static sendGetProjectUsers(projectID) {
    return axios.get('get-project-users', {
      headers: authHeader(),
      params: { project_id: projectID },
    });
  }

  // Send HTTP-request to get all users projects.
  static sendGetUserProjects() {
    return axios.get('get-user-projects', {
      headers: authHeader(),
    });
  }

  /* Send HTTP-request to add one or more text data points to an existing project.

    Below is the expected structure of JSONFile's content for the different project types:

    Document classification:
    JSON shape, where labels may be omitted:
    [
        {
            "text": "Excellent customer service.",
            "labels": ["positive", "negative"]
        },
        ...
    ]

    Sequence labeling:
    JSON shape, where labels may be omitted:
    [
        {
            "text": "Alex is going to Los Angeles in California",
            "labels": [
                [0, 3, "PER"],
                [16, 27, "LOC"],
                [31, 41, "LOC"]
                ]
        },
        ...
    ]

    Sequence to sequence:
    JSON shape, where labels may be omitted:
    [
        {
            "text": "John saw the man on the mountain with a telescope.",
            "labels": [
                "John såg mannen på berget med hjälp av ett teleskop.",
                "John såg mannen med ett teleskop på berget."
            ]
        },
    ]
  */
  static sendAddNewTextData(projectID, JSONFile, onUploadProgress) {
    const formData = new FormData();
    formData.append('project_id', projectID);
    formData.append('json_file', JSONFile);
    return axios.post('add-text-data', formData, {
      headers: { 'Content-type': 'multipart/form-data', ...authHeader() },
      onUploadProgress,
    });
  }

  /* Send HTTP-request to add one or more text data points to an existing project.
    Below is the expected structure of JSONFile's content:

    JSON shape, where labels may be omitted:
    [
        {
            "labels": [
                [[442, 420], [530, 540], "car"],
                [[700, 520], [800, 640], "bus"]
            ]
        },
        ...
    ]
   */

  static sendAddNewImageData(projectID, JSONFile, imageFiles, onUploadProgress) {
    const formData = new FormData();
    formData.append('project_id', projectID);
    formData.append('json_file', JSONFile);
    [...imageFiles].forEach((img) => formData.append('images', img));
    return axios.post('add-image-data', formData, {
      headers: { 'Content-type': 'multipart/form-data', ...authHeader() },
      onUploadProgress,
    });
  }

  // Send HTTP-request to fetch default labels.
  static sendGetDefaultLabel(projectID) {
    return axios.get('get-default-labels', {
      headers: authHeader(),
      params: { project_id: projectID },
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(projectID, type, index = 0) {
    return axios.get('get-data', {
      headers: authHeader(),
      params: { project_id: projectID, type, index },
    });
  }

  static sendGetAmountOfData(projectID) {
    return axios.get('get-data-amount', {
      headers: authHeader(),
      params: { project_id: projectID },
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetLabel(projectID, dataID) {
    return axios.get('get-label', {
      headers: authHeader(),
      params: { project_id: projectID, data_id: dataID },
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateDocumentClassificationLabel(dataID, label) {
    return axios.post(
      'label-document',
      {
        data_id: dataID,
        label,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateSequenceLabel(dataID, label, begin, end) {
    return axios.post(
      'label-sequence',
      {
        data_id: dataID,
        label,
        begin,
        end,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateSequenceToSequenceLabel(dataID, label) {
    return axios.post(
      'label-sequence-to-sequence',
      {
        data_id: dataID,
        label,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateImageClassificationLabel(dataID, label, x1, y1, x2, y2) {
    return axios.post(
      'label-image',
      {
        data_id: dataID,
        label,
        x1,
        y1,
        x2,
        y2,
      },
      {
        headers: authHeader(),
      }
    );
  }

  // Send HTTP-request to remove a label.
  static sendRemoveLabel(labelID) {
    return axios.delete('remove-label', {
      headers: authHeader(),
      data: { label_id: labelID },
    });
  }

  /* Send HTTP-request to get data to be exported.
    Below is the structure of the returned JSON data.

    Document classification
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
        data: [
            {
                "text": "Excellent customer service.",
                "labels": ["positive"]
            },
            ...
        ]
    }

    Sequence labeling:
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
        data: [
            {
                "text": "Alex is going to Los Angeles in California",
                "labels": [
                    [0, 3, PER],
                    [16, 27, LOC],
                    [31, 41, LOC]
                ]
            },
            ...
        ]
    }

    Sequence to sequence:
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
        data: [
            {
                "text": "John saw the man on the mountain with a telescope.",
                "labels": [
                    "John såg mannen på berget med hjälp av ett teleskop.",
                    "John såg mannen med ett teleskop på berget."
                ]
            },
            ...
        ]
    }

    Image classification:
    {
        project_id: 0,
        project_name: "project name",
        project_type: 1,
        data: [
            {
                "file_name": "image.jpg",
                "id": 101,
                "labels": [
                    [[442, 420], [530, 540], "car"],
                    [[700, 520], [800, 640], "bus"]
                ]
            },
            ...
        ]
    }
  */
  static sendGetExportData(projectID, onDownloadProgress /* , filters = [] */) {
    // FIXME
    // const params = new URLSearchParams();
    // params.append('headers', authHeader());
    // params.append('project_id', projectID);

    // filters.forEach((element) => {
    //   params.append('filter', element);
    // });

    return axios.get('get-export-data', {
      headers: authHeader(),
      responseType: 'arraybuffer',
      params: {
        project_id: projectID,
      },
      onDownloadProgress,
    });
  }

  // Send HTTP-request to get image file from a data point.
  static sendGetImageData(dataID) {
    return axios.get('get-image-data', {
      headers: authHeader(),
      responseType: 'blob',
      params: { data_id: dataID },
    });
  }

  // Send HTTP-request to reset database (TODO: remove for production).
  static sendResetDatabase() {
    return axios.get('reset');
  }
}
export default HTTPLauncher;
