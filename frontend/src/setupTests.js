/* 
This file is used to mock browser APIs for Jest tests.
See https://create-react-app.dev/docs/running-tests/#initializing-test-environment
*/

import HTTPLauncher from './services/HTTPLauncher';

// Tests won't work using localhost. Must use backend.
HTTPLauncher.setBaseURL('http://backend:5000/');

// Mock of localStorage.
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
