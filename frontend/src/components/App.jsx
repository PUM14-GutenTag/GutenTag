import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';

import '../css/App.css';

// eslint-disable-next-line no-unused-vars
const axios = require('axios');

// Placeholder content from create-react-app script.
function App() {
  return (
    <div className="page-container">
      <div className="content-wrap">
        <h1>
          <Router>
            <Switch>
              <Route exact path="/home" component={Home} />
              <Route exact path="/settings" component={Settings} />
              <Route exact path="/projects" component={Projects} />
            </Switch>
          </Router>
        </h1>
      </div>
    </div>
  );
}

export default App;
