import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

//Pages
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import Projects from '../pages/Projects';
import NotFoundPage from '../pages/404';
import Layout from '../components/Layout';

//Styles
import '../css/index.css';
import '../css/App.css';

// Placeholder content from create-react-app script.
function App() {
  return (
    <Layout>
      <div className="page-container">
        <div className="content-wrap">
          <Router>
            <Switch>
              <Route exact path="/home" component={Home} />
              <Route exact path="/settings" component={Settings} />
              <Route exact path="/projects" component={Projects} />
              <Route exact path="/404" component={NotFoundPage} />
              <Redirect to="/404"/>
            </Switch>
          </Router>
        </div>
      </div>
    </Layout>
  );
}

export default App;
