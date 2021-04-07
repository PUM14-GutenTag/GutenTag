/* Integrations tests for HTTPLauncher.js, and in turn api.routes.py. */

const HTTPLauncher = require('../services/HTTPLauncher');

const createUser = async (admin = true) => {
  const email = 'mail@gmail.com';
  const password = 'pass';
  await HTTPLauncher.sendRegister('Nameer', 'Sur', password, email, admin);
  const response = await HTTPLauncher.sendLogin(email, password);
  localStorage.setItem('gutentag-accesstoken', response.data.access_token);
  localStorage.setItem('gutentag-refreshtoken', response.data.refresh_token);

  return email;
};

const createProject = async (type) => {
  const response = await HTTPLauncher.sendCreateProject('Project Exodus', type);
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

    const authorizeResponse = await HTTPLauncher.sendAuthorizeUser(projectID, email);
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

    const data = JSON.stringify([
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
    ]);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, projectType, data);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 2;
    const projectID = await createProject(projectType);

    const data = JSON.stringify([
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
    ]);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, projectType, data);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });

  test('Sequence to sequence request', async () => {
    await resetDB();
    await createUser();
    const projectType = 3;
    const projectID = await createProject(projectType);

    const data = JSON.stringify([
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
    ]);

    const response = await HTTPLauncher.sendAddNewTextData(projectID, projectType, data);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  });
});

describe('sendNewImageData request', () => { });

describe('sendGetData request', () => { });

describe('sendCreateDocumentClassificationLabel request', () => { });

describe('request', () => { });

describe('request', () => { });

describe('request', () => { });

describe('request', () => { });
