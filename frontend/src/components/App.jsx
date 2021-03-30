import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

//Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';
import Login from '../pages/Login';
import NotFoundPage from '../pages/404';

import '../css/App.css';

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
              <Route exact path="/" component={Login} />
              <Route exact path="/404" component={NotFoundPage} />
              <Redirect to="/404"/>
            </Switch>
          </Router>
        </h1>
      </div>
    </div>
  );
}

export default App;
