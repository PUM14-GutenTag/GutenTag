import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';
import NotFoundPage from '../pages/404';
import Login from '../pages/Login';
import Labeling from '../pages/Labeling';

// Components
import ProtectedRoute from './ProtectedRoute';

// Styles
import '../css/App.css';

// App content.
const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <ProtectedRoute exact path="/labeling/:projectType/:id" component={Labeling} />
        <ProtectedRoute exact path="/home" component={Home} />
        <ProtectedRoute exact path="/settings" component={Settings} />
        <ProtectedRoute exact path="/projects" component={Projects} />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>
    </Router>
  );
};

export default App;
