import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/App.css';

import Login from './pages/Login';

import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/">
          <div className="page-container">
            <div className="content-wrap">
              <Login />
            </div>
          </div>
        </Route>
        <App />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
