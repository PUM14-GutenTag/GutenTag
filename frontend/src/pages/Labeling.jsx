import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'react-bootstrap-icons';

import ProgressBar from 'react-bootstrap/ProgressBar';
import { useParams } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import HTTPLauncher from '../services/HTTPLauncher';
import DocumentClassification from '../components/DocumentClassification';
import '../css/Labeling.css';

const Labeling = () => {
  const [projectData, setProjectData] = useState('');
  const type = useParams().projectType;

  const projectId = useParams().id;

  async function fetchProjectData() {
    // const result = await HTTPLauncher.sendGetUserProjects();
    // const data = Object.values(result.data.projects.)
    const response = await HTTPLauncher.sendGetData(projectId, 1);
    console.log(response);
    setProjectData(response);
  }

  async function testAddProjectData() {
    const response = await HTTPLauncher.sendAddNewTextData(
      projectId,
      JSON.stringify([
        {
          text: 'Gosling provides an amazing performance that dwarfs everything else in the film.',
          labels: [],
        },
      ])
    );
    console.log(response);
  }

  useEffect(() => {
    fetchProjectData();
    console.log(type);
  }, []);

  /*

  

  progressbar för hela projektet
  progressbar för användare

  hämta typ av projekt
  olika containers beroende på labling-uppgift (if-statement)
  hämta specifika datan för projektet

  Nån form av textruta där labels skrivs
 */

  const renderAuthButton = (typeOfProject) => {
    console.log(`this is the type ${typeof type}`);
    if (typeOfProject === '1') {
      return <DocumentClassification />;
    }
    return <button>Login</button>;
  };

  return (
    <div>
      <ProgressBar striped variant="success" now={40} />
      <br />
      <ProgressBar striped variant="warning" now={80} />
      <br />
      <div className="container">
        <div className="main-content">
          <ChevronLeft className="left-align make-large fa-10x" />
          <div className="data-content">{renderAuthButton(type)}</div>
          <ChevronRight className="right-align make-large fa-10x" />
        </div>
        <br />

        <input type="text" />
        <br />
        <button type="button" className="btn btn-primary" onClick={testAddProjectData}>
          Done labeling
        </button>
      </div>
    </div>
  );
};

export default Labeling;
