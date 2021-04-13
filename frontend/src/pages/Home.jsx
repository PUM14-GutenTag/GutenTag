import React, { useState, useEffect } from 'react';
import CreateProject from '../components/CreateProject';
import Project from '../components/Project';
import HTTPLauncher from '../services/HTTPLauncher';
import Button from 'react-bootstrap/Button';
import '../css/home.css';

const Home = () => {
  const [projectsShow, setProjectsShow] = useState(true);
  const [projects, setProjects] = useState([]);
  var colorCounter = 0;
  const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

  useEffect(() => {
    if (projectsShow){
    async function fetchData() {
      const result = await HTTPLauncher.sendGetUserProjects();
      /*makes Object of Objects to Array of Arrays*/
      const dataArray = Object.values(result.data.projects);
      const mapedDataArray = dataArray.map((projectObject) => Object.values(projectObject));
      setProjects(mapedDataArray);
    }
    fetchData();}
  }, [projectsShow]);

  function toggleProjects() {
    setProjectsShow((previousValue) => !previousValue);
  }

  function setColorCounter() {
    const selectedColor = colorList[colorCounter];
    colorCounter = colorCounter + 1;
    if (colorCounter === colorList.length) {
      colorCounter = 0;
    }
    return selectedColor;
  }

  return (
    <div className="home-container">
      {projectsShow ? (
        <div className="projects-container">
          <Button className="toggleButton" variant="success" onClick={toggleProjects}>
            Create project
          </Button>
          <ul>
            {projects.map((result) => (
              <li key={result}>
                <Project
                  created={result[0]}
                  name={result[1]}
                  projectType={result[2]}
                  selectedColor={setColorCounter()}
                ></Project>
              </li>
            ))}
          </ul>
          <div></div>
        </div>
      ) : (
        <div>
          <Button className="toggleButton" variant="success" onClick={toggleProjects}>
            Back to home
          </Button>
          <CreateProject toggleCallback={toggleProjects}></CreateProject>
        </div>
      )}
    </div>
  );
};

export default Home;
