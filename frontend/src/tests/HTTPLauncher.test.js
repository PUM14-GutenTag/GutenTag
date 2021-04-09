/* Integrations tests for HTTPLauncher.js, and in turn api.routes.py. */

import fs from 'fs';
import path from 'path';

const HTTPLauncher = require('../services/HTTPLauncher');

const outDir = path.join(__dirname, 'out');

beforeAll(() => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
});

const documentData = [
  {
    text: 'Gosling provides an amazing performance that dwarfs everything else in the film.',
    labels: ['positive'],
  },
  {
    text:
      "Not for everyone, but for those with whom it will connect, it's a nice departure from standard moviegoing fare.",
    labels: ['positive', 'negative'],
  },
  {
    text:
      'A disturbing and frighteningly evocative assembly of imagery and hypnotic music composed by Philip Glass.',
    labels: [],
  },
];

const sequenceData = [
  {
    text: 'Alex is going to Los Angeles in California',
    labels: [
      [0, 3, 'PER'],
      [16, 27, 'LOC'],
      [31, 41, 'LOC'],
    ],
  },
  { text: 'Peter Blackburn', labels: [[0, 15, 'PER']] },
  { text: 'President Obama', labels: [] },
];

const seqToSeqData = [
  {
    text: 'India and Japan prime ministers meet in Tokyo',
    labels: ['Die Premierminister Indiens und Japans trafen sich in Tokio .'],
  },
  {
    text: 'History is a great teacher',
    labels: ['Die Geschichte ist ein großartiger Lehrmeister .'],
  },
  {
    text: 'But it in certainly not a radical initiative - at least by American standards .',
    labels: [],
  },
];

const imageData = [
  {
    file_name: 'ILSVRC2012_val_00000001.JPEG',
    labels: [[[50, 100], [90, 120], 'snake']],
  },
  {
    file_name: 'ILSVRC2012_val_00000002.JPEG',
    labels: [
      [[75, 125], [100, 150], 'person'],
      [[100, 150], [160, 200], 'person'],
    ],
  },
  {
    file_name: 'ILSVRC2012_val_00000003.JPEG',
    labels: [],
  },
];

const images = [
  './res/images/ILSVRC2012_val_00000001.JPEG',
  './res/images/ILSVRC2012_val_00000002.JPEG',
  './res/images/ILSVRC2012_val_00000003.JPEG',
].map((name) => {
  const filepath = path.resolve(__dirname, name);
  return new File([fs.readFileSync(filepath, { encoding: 'base64' })], path.basename(filepath));
});

const createUser = async (admin = true) => {
  const email = 'mail@gmail.com';
  const password = 'pass';
  await HTTPLauncher.sendRegister('Nameer', 'Sur', password, email, admin);
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

describe('sendRegister request', () => {
  test('Correct admin', async () => {
    await resetDB();
    const response = await HTTPLauncher.sendRegister(
      'Nameer',
      'Sur',
      'pass',
      'mail@gmail.com',
      true
    );
    expect(response.status).toBe(200);
  });
});

describe('sendLogin request', () => {
  test('Correct login', async () => {
    await resetDB();
    const email = 'mail@gmail.com';
    const password = 'pass';
    const registerResponse = await HTTPLauncher.sendRegister(
      'Nameer',
      'Sur',
      password,
      email,
      true
    );
    expect(registerResponse.status).toBe(200);
    expect(registerResponse.data.id).toBeDefined();

    const loginResponse = await HTTPLauncher.sendLogin(email, password);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data.access_token).toBeDefined();
    expect(loginResponse.data.refresh_token).toBeDefined();
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
    const email = await createUser();
    const projectID = await createProject(1);

    const response = await HTTPLauncher.sendAuthorizeUser(projectID, email);
    expect(response.status).toBe(200);
  });
});

describe('sendDeauthorizeUser request', () => {
  test('Correct request', async () => {
    await resetDB();
    const email = await createUser();
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

describe('sendAddNewTextData request', () => {
  test('Document classification request', async () => {
    await resetDB();
    await createUser();
    const projectType = 1;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(documentData));
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(sequenceData));
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence to sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(seqToSeqData));
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
      JSON.stringify(imageData),
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(documentData));
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = documentData.map((obj) => obj.text);
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence labeling project', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(sequenceData));
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = sequenceData.map((obj) => obj.text);
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Sequence to sequence project', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType, 'SeqToSeq');

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(seqToSeqData));
    const response = await HTTPLauncher.sendGetData(projectID, 5);
    expect(response.status).toBe(200);
    expect(Object.keys(response.data).length).toBe(3);
    const originalTexts = seqToSeqData.map((obj) => obj.text);
    Object.values(response.data).forEach((text) => expect(originalTexts).toContain(text));
  });

  test('Image classification project', async () => {
    await resetDB();
    await createUser();
    const projectType = 4;
    const projectID = await createProject(projectType);

    await HTTPLauncher.sendAddNewImageData(projectID, JSON.stringify(imageData), images);

    const getDataResponse = await HTTPLauncher.sendGetData(projectID, 5);
    expect(getDataResponse.status).toBe(200);
    expect(Object.keys(getDataResponse.data).length).toBe(3);
    const fileNames = imageData.map((obj) => obj.file_name);
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(documentData));
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(sequenceData));
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(seqToSeqData));
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

    await HTTPLauncher.sendAddNewImageData(projectID, JSON.stringify(imageData), images);
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(documentData));
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

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(documentData));
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateDocumentClassificationLabel(1, 'new label');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const parsed = JSON.parse(response.data);
    const texts = parsed.data.map((d) => d.text);

    documentData.forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(2, 'Sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(sequenceData));
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateSequenceLabel(1, 'new label', 0, 3);

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const parsed = JSON.parse(response.data);
    const texts = parsed.data.map((d) => d.text);

    sequenceData.forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Sequence to sequence project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(3, 'Sequence to sequence');

    await HTTPLauncher.sendAddNewTextData(projectID, JSON.stringify(seqToSeqData));
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateSequenceToSequenceLabel(1, 'new label');

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const parsed = JSON.parse(response.data);
    const texts = parsed.data.map((d) => d.text);

    seqToSeqData.forEach((obj) => {
      expect(texts).toContain(obj.text);
    });
  });

  test('Image classification project', async () => {
    await resetDB();
    await createUser();
    const projectID = await createProject(4, 'Image');

    await HTTPLauncher.sendAddNewImageData(projectID, JSON.stringify(imageData), images);
    await HTTPLauncher.sendGetData(projectID, 5);
    await HTTPLauncher.sendCreateImageClassificationLabel(1, 'new label', 100, 120, 200, 220);

    const response = await HTTPLauncher.sendGetExportData(projectID);
    expect(response.status).toBe(200);
    const parsed = JSON.parse(response.data);
    const fileNames = parsed.data.map((d) => d.file_name);

    imageData.forEach((obj) => {
      expect(fileNames).toContain(obj.file_name);
    });
  });
});
