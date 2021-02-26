import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';

import '../css/App.css';

import logo from '../res/logo.svg';

const axios = require('axios');

// Placeholder content from create-react-app script.
function App() {
  const [placeholder, setPlaceholder] = useState(-1);

  

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
