import authHeader from './auth-header';

const axios = require('axios');

let apiURL = 'http://localhost:5000/';

const axiosInstance = () =>
  axios.create({
    baseURL: apiURL,
  });

class HTTPLauncher {
  // Sets the base URL for all requests.
  static setBaseURL(URL) {
    apiURL = URL;
  }

  // Send HTTP-request to register a user.
  static sendRegister(firstName, lastName, password, email, admin) {
    return axiosInstance().post('register', {
      first_name: firstName,
      last_name: lastName,
      password,
      email,
      admin,
    });
  }

  // Send HTTP-request to create a user
  static sendCreateUser(firstName, lastName, password, email, admin) {
    return axiosInstance().post('create-user', {
      first_name: firstName,
      last_name: lastName,
      password,
      email,
      admin,
    });
  }

  // Send HTTP-request to login a user.
  static sendLogin(email, password) {
    return axiosInstance().post('login', {
      email,
      password,
    });
  }

  // Send HTTP-request to change password
  static sendChangePassword(oldPassword, newPassword) {
    return axiosInstance().post(
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
    return axiosInstance().post(
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
    return axiosInstance().post(
      'refresh-token',
      {},
      {
        headers: authHeader(true),
      }
    );
  }

  // Send HTTP-request to authorize a user to a project.
  static sendAuthorizeUser(projectID, email) {
    return axiosInstance().post(
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
    return axiosInstance().post(
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

  // Send HTTP-request to create a new project.
  static sendCreateProject(projectName, projectType) {
    return axiosInstance().post(
      'create-project',
      {
        project_name: projectName,
        project_type: projectType,
      },
      { headers: authHeader() }
    );
  }

  // Send HTTP-request to delete an existing project.
  static sendDeleteProject(projectID) {
    return axiosInstance().delete('delete-project', {
      headers: authHeader(),
      data: { project_id: projectID },
    });
  }

  // Send HTTP-request to get a users name.
  static sendGetUserName() {
    return axiosInstance().get('get-user-name', {
      headers: authHeader(),
    });
  }

  static sendGetUserProjects() {
    return axiosInstance().get('get-user-projects', {
      headers: authHeader(),
    });
  }

  /* Send HTTP-request to add one or more text data points to an existing project.

    Below is the expected structure of JSONData for the different project types:
     
    Document classification:
    JSONData shape, where labels may be omitted:
    [
        {
            "text": "Excellent customer service.",
            "labels": ["positive", "negative"]
        },
        ...
    ]

    Sequence labeling:
    JSONData shape, where labels may be omitted:
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
    JSONData shape, where labels may be omitted:
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
  static sendAddNewTextData(projectID, JSONData) {
    return axiosInstance().post(
      'add-text-data',
      {
        project_id: projectID,
        json_data: JSONData,
      },
      {
        headers: authHeader(),
      }
    );
  }

  /* Send HTTP-request to add one or more text data points to an existing project.
    Below is the expected structure of JSONData:
    
    JSONData shape, where labels may be omitted:
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
  static sendAddNewImageData(projectID, JSONData, images) {
    const formData = new FormData();
    formData.append('project_id', projectID);
    formData.append('json_data', JSONData);
    images.forEach((i) => formData.append('images', i));
    return axiosInstance().post('add-image-data', formData, {
      headers: { 'Content-type': 'multipart/form-data', ...authHeader() },
    });
  }

  // Send HTTP-request to fetch datapoints to be labelled.
  static sendGetData(projectID, amount = 1) {
    return axiosInstance().get('get-data', {
      headers: authHeader(),
      params: { project_id: projectID, amount },
    });
  }

  // Send HTTP-request to label a datapoint.
  static sendCreateDocumentClassificationLabel(dataID, label) {
    return axiosInstance().post(
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
    return axiosInstance().post(
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
    return axiosInstance().post(
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
    return axiosInstance().post(
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
    return axiosInstance().delete('remove-label', {
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
  static sendGetExportData(projectID /* , filters = [] */) {
    // FIXME
    // const params = new URLSearchParams();
    // params.append('headers', authHeader());
    // params.append('project_id', projectID);

    // filters.forEach((element) => {
    //   params.append('filter', element);
    // });

    return axiosInstance().get('get-export-data', {
      headers: authHeader(),
      params: {
        project_id: projectID,
      },
    });
  }

  // Send HTTP-request to get image file from a data point.
  static sendGetImageData(dataID) {
    return axiosInstance().get('get-image-data', {
      headers: authHeader(),
      params: { data_id: dataID },
    });
  }

  // Send HTTP-request to reset database (TODO: remove for production).
  static sendResetDatabase() {
    return axiosInstance().get('reset');
  }
}
export default HTTPLauncher;
