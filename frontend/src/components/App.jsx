import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import NotFound from '../pages/404';
import Login from '../pages/Login';
import EditProject from '../pages/EditProject';
import { UserProvider } from '../contexts/UserContext';

// Components
import ProtectedRoute from './ProtectedRoute';

// Styles
import '../css/App.css';
import '../css/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// App content.
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <ProtectedRoute exact path="/home" component={Home} />
          <ProtectedRoute exact path="/home" component={Home} />
          <ProtectedRoute exact path="/settings" component={Settings} />
          <ProtectedRoute exact path="/edit-project" component={EditProject} />
          <Route exact path="/404" component={NotFound} />
          <Redirect to="/404" />
        </Switch>
      </Router>
    </UserProvider>
  );
};

export default App;
