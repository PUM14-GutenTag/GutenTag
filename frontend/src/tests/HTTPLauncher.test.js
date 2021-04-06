/* Integrations tests for HTTPLauncher.js, and in turn api.routes.py. */

const HTTPLauncher = require('../services/HTTPLauncher');

const createUser = async (admin = true) => {
  const email = 'mail@gmail.com';
  const password = 'pass';
  await HTTPLauncher.sendRegister('Nameer', 'Sur', password, email, admin);
  const loginResponse = await HTTPLauncher.sendLogin(email, password);
  localStorage.setItem('gutentag-accesstoken', loginResponse.data.access_token);
  localStorage.setItem('gutentag-refreshtoken', loginResponse.data.refresh_token);
  console.log(loginResponse.data);
};

afterAll(async () => {
  await HTTPLauncher.sendResetDatabase();
});

beforeEach(async () => {
  await HTTPLauncher.sendResetDatabase();
});

describe('sendRegister request', () => {
  test('Correct admin', async () => {
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
  // test('Request without user', async () => {
  //   const accessToken = await HTTPLauncher.sendRefreshToken();
  //   console.log(accessToken);
  // });

  test('Correct request', async () => {
    const tokens = await createUser();
    // console.log(tokens);
    const accessToken = await HTTPLauncher.sendRefreshToken();
    // console.log(accessToken);
  });
});

describe('sendAuthorizeUser request', () => { });

describe('sendDeauthorizeUser request', () => { });

describe('sendDeleteProject request', () => { });

describe('sendAddNewTextData request', () => { });

describe('sendNewImageData request', () => { });

describe('sendGetData request', () => { });

describe('sendCreateDocumentClassificationLabel request', () => { });

describe('request', () => { });

describe('request', () => { });

describe('request', () => { });

describe('request', () => { });

describe('request', () => { });
