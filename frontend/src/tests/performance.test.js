/* eslint-disable no-console */
/* Performance test for file import/export. Should not be run on every test run as it takes a lot of
time and requires external datasets.

Before running, please copy the dataset directories from the
'datasets' folder in OneDrive into /test_resources/extra/.
*/
import fs from 'fs';
import path from 'path';

import testUtil from './testUtil';
import HTTPLauncher from '../services/HTTPLauncher';

const textDir = path.join(__dirname, 'res/text');
const extraTextDir = path.join(__dirname, 'res/extra/text');
const extraImgDir = path.join(__dirname, 'res/extra/images');

const getImages = (amount) =>
  Array.from({ length: amount }, (_, i) => i + 1).map((n) => {
    const name = `ILSVRC2012_val_${n.toString().padStart(8, '0')}.JPEG`;
    const filepath = path.resolve(extraImgDir, name);
    return new File([fs.readFileSync(filepath, { encoding: 'base64' })], path.basename(filepath));
  });

describe('Test requirement "50 HTTP requests/sec".', () => {
  // This test won't be fast enough until we can parallelize with gunicorn.
  test('Ping server with logins', async () => {
    await testUtil.resetDB();
    const email = 'mail@gmail.com';
    const password = 'pass';
    await HTTPLauncher.sendRegister('Nameer', 'Sur', password, email, true);

    const start = new Date();
    const numRequests = 1000;
    // eslint-disable-next-line no-restricted-syntax
    for (const i of [...Array(numRequests).keys()]) {
      // eslint-disable-next-line no-await-in-loop
      await HTTPLauncher.sendLogin(email, password);
    }
    const duration = (new Date() - start) / 1000;
    const maxDuration = numRequests / 50;
    expect(duration).toBeLessThan(maxDuration);
    console.log(`Operation took: ${duration} seconds (maximum ${maxDuration})`);
  }, 30000);
});

describe('Test requirement "Index and store 100 data points of size 10 MB in 10 seconds".', () => {
  test('100 images', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 4;
    const projectID = await testUtil.createProject(projectType);

    // Load the 100 first images in the dataset from file system (around 13 MB)
    const images = getImages(100);
    // Start timer for the operation itself.
    const start = new Date();
    const response = await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(textDir, 'input_image_classification_100.json'),
      images
    );
    const duration = (new Date() - start) / 1000;
    expect(duration).toBeLessThan(10000);
    console.log(`Operation took: ${duration} seconds`);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  }, 20000);
});

describe('Test requirement "Handle datasets up to 250 MB in size".', () => {
  test('Document classification dataset', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 1;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(extraTextDir, 'large_document_classification.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  }, 900000);

  test('Sequence labeling dataset', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 2;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(extraTextDir, 'large_sequence_labeling.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  }, 900000);

  test('Sequence to sequencelabeling dataset', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 3;
    const projectID = await testUtil.createProject(projectType);

    const response = await HTTPLauncher.sendAddNewTextData(
      projectID,
      testUtil.getTextFile(extraTextDir, 'large_sequence_to_sequence.json')
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  }, 900000);

  test('Image classification dataset', async () => {
    await testUtil.resetDB();
    await testUtil.createUser();
    const projectType = 4;
    const projectID = await testUtil.createProject(projectType);

    // Load the 2000 first images in the dataset from file system (around 250 MB)
    const images = getImages(2000);
    const response = await HTTPLauncher.sendAddNewImageData(
      projectID,
      testUtil.getTextFile(extraTextDir, 'large_image_classification.json'),
      images
    );
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Data added.');
  }, 900000);
});
