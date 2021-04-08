import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';
import NotFoundPage from '../pages/404';
import LayoutRoute from './Layout';
import Login from '../pages/Login';

// Styles
import '../css/index.css';
import '../css/App.css';

// Placeholder content from create-react-app script.
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <LayoutRoute exact path="/home" component={Home} />
        <LayoutRoute exact path="/settings" component={Settings} />
        <LayoutRoute exact path="/projects" component={Projects} />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>
    </Router>
  );
}

export default App;
