/* Integration tests for HTTPLauncher.js, and in turn api.routes.py. */

import fs from 'fs';
import path from 'path';

import testUtil from './testUtil';
import HTTPLauncher from '../services/HTTPLauncher';

const textDir = path.join(__dirname, 'res/text');
const imgDir = path.join(__dirname, 'res/images');
const outDir = path.join(__dirname, 'out');

beforeAll(() => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
});

const images = [
  'ILSVRC2012_val_00000001.JPEG',
  'ILSVRC2012_val_00000002.JPEG',
  'ILSVRC2012_val_00000003.JPEG',
].map((name) => {
  const filepath = path.resolve(imgDir, name);
  return new File([fs.readFileSync(filepath, { encoding: 'base64' })], path.basename(filepath));
});

describe('sendCreateUser and sendLogin requests', () => {
  test('Correct admin', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const loginResponse = await HTTPLauncher.sendLogin('mail@gmail.com', 'pass');
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data.access_token).toBeDefined();
    expect(loginResponse.data.refresh_token).toBeDefined();
  });
});

describe('sendChangePassword request', () => {
  test('Succesfully change password of own user', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

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
    await testUtil.resetDB();
    await testUtil.createUser();

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
    await testUtil.resetDB();
    await testUtil.createUser();

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
    await testUtil.resetDB();

    await HTTPLauncher.sendRefreshToken().catch((e) => {
      expect(e.response.status).toBe(401);
    });
  });

  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const response = await HTTPLauncher.sendRefreshToken();
    expect(response.status).toBe(200);
    expect(response.data.access_token).not.toBe(localStorage.getItem('gutentag-accesstoken'));
    expect(response.data.access_token).not.toBe(localStorage.getItem('gutentag-refreshtoken'));

    localStorage.setItem('gutentag-accesstoken', response.data.access_token);
  });
});

describe('sendAuthorizeUser request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);
    const projectID = await testUtil.createProject(1);
    const response = await HTTPLauncher.sendAuthorizeUser(projectID, email);
    expect(response.status).toBe(200);
  });
});

describe('sendDeauthorizeUser request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, false);
    const projectID = await testUtil.createProject(1);

    await HTTPLauncher.sendAuthorizeUser(projectID, email);
    const deAuthorizeReponse = await HTTPLauncher.sendDeauthorizeUser(projectID, email);
    expect(deAuthorizeReponse.status).toBe(200);
  });
});

describe('sendCreateProject', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const response = await HTTPLauncher.sendCreateProject('Project Exodus', 1);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });
});

describe('sendGetUserInfo', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const response = await HTTPLauncher.sendGetUserInfo();
    expect(response.status).toBe(200);
    expect(response.data.name).toBe('Nameer Sur');
    expect(response.data.email).toBe('mail@gmail.com');
    expect(response.data.access_level).toBe(5);
  });
});

describe('sendGetProjectUsers', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(1);

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
    await testUtil.resetDB();
    await testUtil.createUser(true);
    await testUtil.createProject(1, 'Project 1');
    await testUtil.createProject(2, 'Project 2');

    const response = await HTTPLauncher.sendGetUserProjects();
    expect(response.status).toBe(200);
    expect(response.data.projects['1'].type).toBe(1);
    expect(response.data.projects['2'].type).toBe(2);
  });
});

describe('sendDeleteProject request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(1);

    const response = await HTTPLauncher.sendDeleteProject(projectID);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });
});

describe('sendDeleteUser request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();

    const email = 'normal@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendCreateUser('Reeman', 'Rus', password, email, true);

    const deleteResponse = await HTTPLauncher.sendDeleteUser(email);
    expect(deleteResponse.status).toBe(200);

    try {
      await HTTPLauncher.sendLogin(email, password);
    } catch (e) {
      expect(e.response.status).toBe(404);
      expect(e.response.data.access_token).toBeNull();
    }

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
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 1;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_document_classification.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 2;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence to sequence request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 3;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence_to_sequence.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });
});

describe('sendAddNewImageData request', () => {
  test('Image classification request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 4;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(textDir, 'input_image_classification.json'),
      images
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });
});

describe('sendGetData request', () => {
  test('Document classification project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 1;
    const projectID = await testUtil.createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_document_classification.json')
    );
    const response = await HTTPLauncher.sendGetData(projectID, 0);
    expect(response.status).toBe(200);
    expect(response.data.list.length).toBe(11);
    let counter = 0;
    const textList = [];
    response.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
        textList.push(obj.data);
      }
    });
    expect(counter).toBe(3);
    const originalTexts = testUtil
      .getJSONObject(textDir, 'input_document_classification.json')
      .map((obj) => obj.text);
    textList.forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence labeling project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 2;
    const projectID = await testUtil.createProject(projectType, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence.json')
    );
    const response = await HTTPLauncher.sendGetData(projectID, 0);
    expect(response.status).toBe(200);
    expect(response.data.list.length).toBe(11);
    let counter = 0;
    const textList = [];
    response.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
        textList.push(obj.data);
      }
    });
    expect(counter).toBe(3);
    const originalTexts = testUtil
      .getJSONObject(textDir, 'input_sequence.json')
      .map((obj) => obj.text);
    textList.forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence to sequence project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 3;
    const projectID = await testUtil.createProject(projectType, 'SeqToSeq');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence_to_sequence.json')
    );
    const response = await HTTPLauncher.sendGetData(projectID, 0);
    expect(response.status).toBe(200);
    expect(response.data.list.length).toBe(11);
    let counter = 0;
    const textList = [];
    response.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
        textList.push(obj.data);
      }
    });
    expect(counter).toBe(3);
    const originalTexts = testUtil
      .getJSONObject(textDir, 'input_sequence_to_sequence.json')
      .map((obj) => obj.text);
    textList.forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Image classification project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 4;
    const projectID = await testUtil.createProject(projectType);

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(textDir, 'input_image_classification.json'),
      images
    );

    const getDataResponse = await HTTPLauncher.sendGetImageData(projectID);
    expect(getDataResponse.status).toBe(200);
    expect(getDataResponse.data.type).toBe('image/jpeg');
  });
});

describe('sendCreateDocumentClassificationLabel request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 1;
    const projectID = await testUtil.createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_document_classification.json')
    );
    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 0);
    expect(getDataResponse.status).toBe(200);
    expect(getDataResponse.data.list.length).toBe(11);
    let counter = 0;
    getDataResponse.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
      }
    });
    expect(counter).toBe(3);
    const labelResponse = await HTTPLauncher.sendCreateDocumentClassificationLabel(
      1,
      'new label',
      '#3A6FE8'
    );
    expect(labelResponse.status).toBe(200);

    const getLabelResponse = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.values(getLabelResponse.data.labels)[0].label).toBe('new label');
  });
});

describe('sendCreateSequenceLabel request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 2;
    const projectID = await testUtil.createProject(projectType, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence.json')
    );
    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 0);
    expect(getDataResponse.status).toBe(200);
    expect(getDataResponse.data.list.length).toBe(11);
    let counter = 0;
    getDataResponse.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
      }
    });
    expect(counter).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateSequenceLabel(
      1,
      'new label',
      0,
      3,
      '#3A6FE8'
    );
    expect(labelResponse.status).toBe(200);

    const getLabelResponse = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.values(getLabelResponse.data.labels)[0].label).toBe('new label');
  });
});

describe('sendCreateSequenceToSequenceLabel request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 3;
    const projectID = await testUtil.createProject(projectType, 'Sequence To Sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence_to_sequence.json')
    );
    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 0);
    expect(getDataResponse.status).toBe(200);
    expect(getDataResponse.data.list.length).toBe(11);
    let counter = 0;
    getDataResponse.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
      }
    });
    expect(counter).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateSequenceToSequenceLabel(
      1,
      'new label',
      '#3A6FE8'
    );
    expect(labelResponse.status).toBe(200);
    const getLabelResponse = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.values(getLabelResponse.data.labels)[0].label).toBe('new label');
  });
});

describe('sendCreateImageClassificationLabel request', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 4;
    const projectID = await testUtil.createProject(projectType);

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(textDir, 'input_image_classification.json'),
      images
    );
    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 0);
    expect(getDataResponse.status).toBe(200);
    const labelResponse = await HTTPLauncher.sendCreateImageClassificationLabel(
      1,
      'new label',
      100,
      120,
      200,
      220,
      '#3A6FE8'
    );
    expect(labelResponse.status).toBe(200);
    const getLabelResponse = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.values(getLabelResponse.data.labels)[0].label).toBe('new label');
  });
});

describe('sendRemoveLabel', () => {
  test('Correct request', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 1;
    const projectID = await testUtil.createProject(projectType, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_document_classification.json')
    );
    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 0);
    expect(getDataResponse.status).toBe(200);
    expect(getDataResponse.data.list.length).toBe(11);
    let counter = 0;
    getDataResponse.data.list.forEach((obj) => {
      if (!(Object.keys(obj).length === 0)) {
        counter += 1;
      }
    });
    expect(counter).toBe(3);

    const labelResponse = await HTTPLauncher.sendCreateDocumentClassificationLabel(
      1,
      'new label',
      '#3A6FE8'
    );
    expect(labelResponse.status).toBe(200);

    const getLabelResponse1 = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.values(getLabelResponse1.data.labels)[0].label).toBe('new label');

    const deleteResponse = await HTTPLauncher.sendRemoveLabel(labelResponse.data.id);
    expect(deleteResponse.status).toBe(200);

    const getLabelResponse2 = await HTTPLauncher.sendGetLabel(projectID, 1);
    expect(Object.keys(getLabelResponse2.data.labels).length).toBe(0);
  });
});

describe('sendGetExportData', () => {
  test('Document classification project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(1, 'Document');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_document_classification.json')
    );
    await HTTPLauncher.sendGetData(projectID, 0);
    await HTTPLauncher.sendCreateDocumentClassificationLabel(1, 'new label', '#3A6FE8');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await testUtil.arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    testUtil.getJSONObject(textDir, 'input_document_classification.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(2, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence.json')
    );
    await HTTPLauncher.sendGetData(projectID, 0);
    await HTTPLauncher.sendCreateSequenceLabel(1, 'new label', 0, 3, '#3A6FE8');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await testUtil.arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    testUtil.getJSONObject(textDir, 'input_sequence.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence to sequence project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(3, 'Sequence to sequence');

    await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(textDir, 'input_sequence_to_sequence.json')
    );
    await HTTPLauncher.sendGetData(projectID, 0);
    await HTTPLauncher.sendCreateSequenceToSequenceLabel(1, 'new label', '#3A6FE8');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const responseObj = await testUtil.arrayBufferToJSONObject(response.data);
    const texts = responseObj.data.map((d) => d.text);

    testUtil.getJSONObject(textDir, 'input_sequence_to_sequence.json').forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Image classification project', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectID = await testUtil.createProject(4, 'Image');

    await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(textDir, 'input_image_classification.json'),
      images
    );
    await HTTPLauncher.sendGetData(projectID, 0);
    await HTTPLauncher.sendCreateImageClassificationLabel(
      1,
      'new label',
      100,
      120,
      200,
      220,
      '#3A6FE8'
    );

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
  });
});
