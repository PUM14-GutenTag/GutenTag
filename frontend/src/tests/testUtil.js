// Util file containing functions that are shared between test files.

import fs from 'fs';
import path from 'path';

import HTTPLauncher from '../services/HTTPLauncher';

const getTextFile = (dir, filename) => {
  const filepath = path.resolve(dir, filename);
  return new File([fs.readFileSync(filepath)], path.basename(filepath));
};

const getJSONObject = (dir, filename) => {
  const filepath = path.resolve(dir, filename);
  return JSON.parse(fs.readFileSync(filepath));
};

const arrayBufferToJSONObject = async (arrayBuffer) => {
  const blob = new Blob([arrayBuffer]);
  const text = await new Response(blob).text();
  return JSON.parse(text);
};

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

export default {
  getTextFile,
  getJSONObject,
  arrayBufferToJSONObject,
  createUser,
  createProject,
  resetDB,
};
