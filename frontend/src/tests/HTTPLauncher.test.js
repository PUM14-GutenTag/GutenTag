/* Integrations tests for HTTPLauncher.js, and in turn api.routes.py. */
import fs from 'fs';
import path from 'path';

import HTTPLauncher from '../services/HTTPLauncher';

const textDir = path.join(__dirname, 'res/text');
const imgDir = path.join(__dirname, 'res/images');
const outDir = path.join(__dirname, 'out');

beforeAll(() => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
});

const getTextFile = (filename) => {
  const filepath = path.resolve(textDir, filename);
  return new File([fs.readFileSync(filepath)], path.basename(filepath));
};

const getJSONObject = (filename) => {
  const filepath = path.resolve(textDir, filename);
  return JSON.parse(fs.readFileSync(filepath));
};

const arrayBufferToJSONObject = async (arrayBuffer) => {
  const blob = new Blob([arrayBuffer]);
  const text = await new Response(blob).text();
  return JSON.parse(text);
};

const images = [
  'ILSVRC2012_val_00000001.JPEG',
  'ILSVRC2012_val_00000002.JPEG',
  'ILSVRC2012_val_00000003.JPEG',
].map((name) => {
  const filepath = path.resolve(imgDir, name);
  return new File([fs.readFileSync(filepath, { encoding: 'base64' })], path.basename(filepath));
});

const createUser = async (admin = true) => {
  const email = 'mail@gmail.com';
  const password = 'pass';
  const initialAdminLogin = await HTTPLauncher.sendLogin('admin@admin', 'password');
  localStorage.setItem('gutentag-accesstoken', initialAdminLogin.data.access_token);
  await HTTPLauncher.sendCreateUser('Nameer', 'Sur', password, email, admin);
  const response = await HTTPLauncher.sendLogin(email, password);
  localStorage.setItem('gutentag-accesstoken', response.data.access_token);
  localStorage.setItem('gutentag-refreshtoken', response.data.refresh_token);

  return email;
};

const createProject = async (type, name = 'Test Project') => {
  const response = await HTTPLauncher.sendCreateProject(name, type);
  return response.data.id;
};

const resetDB = async () => {
  await HTTPLauncher.sendResetDatabase();
};

describe('sendCreateUser and sendLogin requests', () => {
  test('Correct admin', async () => {
    await resetDB();
    await createUser();

    const loginResponse = await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data.access_token).toBeDefined();
    expect(loginResponse.data.refresh_token).toBeDefined();
  });
});

describe('sendChangePassword request', () => {
  test('Succesfully change password of own user', async () => {
    await resetDB();
    await createUser();

    const changePwResponse = await HTTPLauncher.sendChangePassword('pass', 'bass');
    expect(changePwResponse.status).toBe(200);

    try {
      await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');
    } catch (e) {
      expect(e.response.status).toBe(401);
    }

    const successfulLoginResponse = await HTTPLauncher.sendLogin('mail@gmail.com', 'bass');
    expect(changePwResponse.status).toBe(200);
    expect(successfulLoginResponse.data.access_token).toBeDefined();
  });

  test('Unsuccesfully change password of own user', async () => {
    await resetDB();
    await createUser();

    try {
      await HTTPLauncher.sendChangePassword('bass', 'pass');
    } catch (e) {
      expect(e.response.status).toBe(401);
    }

    try {
      await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');
    } catch (e) {
      expect(e.response.status).toBe(401);
      expect(e.response.data.access_token).toBeNull();
      expect(e.response.data.refresh_token).toBeNull();
    }

    const successfulLoginResponse = await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');
    expect(successfulLoginResponse.data.access_token).toBeDefined();
  });
});

describe('sendChangePasswordOther request', () => {
  test('Succesfully change password of own user', async () => {
    await resetDB();
    await createUser();

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);

    await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');

    const changePwResponse = await HTTPLauncher.sendChangePasswordOther(email, 'bass');
    expect(changePwResponse.status).toBe(200);

    try {
      await HTTPLauncher.sendLogin(email, 'pass');
    } catch (e) {
      expect(e.response.status).toBe(401);
      expect(e.response.data.access_token).toBeNull();
      expect(e.response.data.refresh_token).toBeNull();
    }

    const normalLoginResponse = await HTTPLauncher.sendLogin(email, 'bass');
    expect(normalLoginResponse.status).toBe(200);
    expect(normalLoginResponse.data.access_token).toBeDefined();

    try {
      await HTTPLauncher.sendChangePasswordOther(email, 'pass');
    } catch (e) {
      expect(e.response.status).toBe(401);
    }

    const pwNotChangedResponse = await HTTPLauncher.sendLogin(email, 'pass');
    expect(pwNotChangedResponse.status).toBe(200);
    expect(pwNotChangedResponse.data.access_token).toBeDefined();
  });
});

describe('sendRefreshToken request', () => {
  test('Request without user', async () => {
    await resetDB();

    await HTTPLauncher.sendRefreshToken().catch((e) => {
      expect(e.response.status).toBe(401);
    });
  });

  test('Correct request', async () => {
    await resetDB();
    await createUser();

    const response = await HTTPLauncher.sendRefreshToken();
    expect(response.status).toBe(200);
    expect(response.data.access_token).not.toBe(localStorage.getItem('gutentag-accesstoken'));
    expect(response.data.access_token).not.toBe(localStorage.getItem('gutentag-refreshtoken'));

    localStorage.setItem('gutentag-accesstoken', response.data.access_token);
  });
});

describe('sendAuthorizeUser request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);
    const projectID = await createProject(1);
    const response = await HTTPLauncher.sendAuthorizeUser(projectID, email);
    expect(response.status).toBe(200);
  });
});

describe('sendDeauthorizeUser request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);
    const projectID = await createProject(1);

    await HTTPLauncher.sendAuthorizeUser(projectID, email);
    const deAuthorizeReponse = await HTTPLauncher.sendDeauthorizeUser(projectID, email);
    expect(deAuthorizeReponse.status).toBe(200);
  });
});

describe('sendCreateProject', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();

    const response = await HTTPLauncher.sendCreateProject('Project Exodus', 1);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });
});

describe('sendGetUserName', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();

    const response = await HTTPLauncher.sendGetUserName();
    expect(response.status).toBe(200);
    expect(response.data.name).toBe('Nameer Sur');
  });
});

describe('sendGetProjectUsers', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(1);

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);
    await HTTPLauncher.sendAuthorizeUser(projectID, email);

    const response = await HTTPLauncher.sendGetProjectUsers(projectID);
    expect(response.status).toBe(200);
    expect(response.data.users[0]).toBe(email);
  });
});

describe('sendGetUserProjects', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser(true);
    await createProject(1, 'Project 1');
    await createProject(2, 'Project 2');

    const response = await HTTPLauncher.sendGetUserProjects();
    expect(response.status).toBe(200);
    expect(response.data.projects['1'].type).toBe(1);
    expect(response.data.projects['2'].type).toBe(2);
  });
});

describe('sendDeleteProject request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(1);

    const response = await HTTPLauncher.sendDeleteProject(projectID);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });
});

describe('sendDeleteUser request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, true);

    const deleteResponse = await HTTPLauncher.sendDeleteUser(email);
    expect(deleteResponse.status).toBe(200);

    const loginResponse = await HTTPLauncher.sendLogin(email, password);
    expect(loginResponse.access_token).not.toBeDefined();

    const registerAgainResponse = await HTTPLauncher.sendCreateUser(
      'Meeran',
      'Urs',
      'bassword',
      email,
      true
    );
    expect(registerAgainResponse.status).toBe(200);
  });
});

describe('sendAddNewTextData request', () => {
  test('Document classification request', async () => {
    await resetDB();
    await createUser();
    const projectType = 1;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_document_classification.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_sequence.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence to sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_sequence_to_sequence.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });
});

describe('sendAddNewImageData request', () => {
  test('Image classification request', async () => {
    await resetDB();
    await createUser();
    const projectType = 4;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewImageData(
      projectID,
      getTextFile('input_image_classification.json'),
      images
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });
});

describe('sendGetData request', () => {
  test('Document classification project', async () => {
    await resetDB();
    await createUser();
    const projectType = 1;
    const projectID = await createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_document_classification.json')
    );
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = getJSONObject('input_document_classification.json').map(
      (obj) => obj.text
    );
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence labeling project', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, getTextFile('input_sequence.json'));
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = getJSONObject('input_sequence.json').map((obj) => obj.text);
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence to sequence project', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType, 'SeqToSeq');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_sequence_to_sequence.json')
    );
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = getJSONObject('input_sequence_to_sequence.json').map((obj) => obj.text);
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Image classification project', async () => {
    await resetDB();
    await createUser();
    const projectType = 4;
    const projectID = await createProject(projectType);

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      getTextFile('input_image_classification.json'),
      images
    );

    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 5);
    expect(getDataResponse.status).toBe(200);
    expect(Object.keys(getDataResponse.data).length).toBe(3);
    const fileNames = getJSONObject('input_image_classification.json').map((obj) => obj.file_name);
    Object.values(getDataResponse.data).forEach((name) => expect(fileNames).toContain(name));

    // eslint-disable-next-line no-restricted-syntax
    for await (const [id, name] of Object.entries(getDataResponse.data)) {
      const imageResponse = await HTTPLauncher.sendGetImageData(id);

      const filepath = path.resolve(outDir, name);
      fs.writeFileSync(filepath, imageResponse.data, { encoding: 'base64' });
    }
  });
});

describe('sendCreateDocumentClassificationLabel request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectType = 1;
    const projectID = await createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_document_classification.json')
    );
    const getDataResponse1 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse1.data).length).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateDocumentClassificationLabel(1, 'new label');
    expect(labelResponse.status).toBe(200);

    const getDataResponse2 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse2.data).length).toBe(2);
  });
});

describe('sendCreateSequenceLabel request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, getTextFile('input_sequence.json'));
    const getDataResponse1 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse1.data).length).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateSequenceLabel(1, 'new label', 0, 3);
    expect(labelResponse.status).toBe(200);

    const getDataResponse2 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse2.data).length).toBe(2);
  });
});

describe('sendCreateSequenceToSequenceLabel request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType, 'Sequence To Sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_sequence_to_sequence.json')
    );
    const getDataResponse1 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse1.data).length).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateSequenceToSequenceLabel(1, 'new label');
    expect(labelResponse.status).toBe(200);

    const getDataResponse2 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse2.data).length).toBe(2);
  });
});

describe('sendCreateImageClassificationLabel request', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectType = 4;
    const projectID = await createProject(projectType);

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      getTextFile('input_image_classification.json'),
      images
    );
    const getDataResponse1 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse1.data).length).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateImageClassificationLabel(
      1,
      'new label',
      100,
      120,
      200,
      220
    );
    expect(labelResponse.status).toBe(200);

    const getDataResponse2 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse2.data).length).toBe(2);
  });
});

describe('sendRemoveLabel', () => {
  test('Correct request', async () => {
    await resetDB();
    await createUser();
    const projectType = 1;
    const projectID = await createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_document_classification.json')
    );
    const getDataResponse1 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse1.data).length).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateDocumentClassificationLabel(1, 'new label');

    const getDataResponse2 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse2.data).length).toBe(2);

    const deleteResponse = await HTTPLauncher.sendRemoveLabel(labelResponse.data.id);
    expect(deleteResponse.status).toBe(200);

    const getDataResponse3 = await HTTPLauncher.sendGetData(projectID, 5);
    expect(Object.keys(getDataResponse3.data).length).toBe(3);
  });
});

describe('sendGetExportData', () => {
  test('Document classification project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(1, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_document_classification.json')
    );
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateDocumentClassificationLabel(1, 'new label');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    getJSONObject('input_document_classification.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(2, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, getTextFile('input_sequence.json'));
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateSequenceLabel(1, 'new label', 0, 3);

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    getJSONObject('input_sequence.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence to sequence project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(3, 'Sequence to sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      getTextFile('input_sequence_to_sequence.json')
    );
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateSequenceToSequenceLabel(1, 'new label');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    getJSONObject('input_sequence_to_sequence.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Image classification project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(4, 'Image');

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      getTextFile('input_image_classification.json'),
      images
    );
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateImageClassificationLabel(1, 'new label', 100, 120, 200, 220);

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
  });
});
