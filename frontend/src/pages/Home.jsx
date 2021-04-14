import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CreateProject from '../components/CreateProject';
import Project from '../components/Project';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/home.css';

const Home = () => {
  const [projectsShow, setProjectsShow] = useState(true);
  const [projects, setProjects] = useState([]);
  let colorCounter = 0;
  const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

  async function fetchData() {
    const result = await HTTPLauncher.sendGetUserProjects();
    const dataArray = Object.values(result.data.projects);
    const mapedDataArray = dataArray.map((projectObject) => Object.values(projectObject));
    setProjects(mapedDataArray);
  }

  useEffect(() => {
    if (projectsShow) {
      fetchData();
    }
  }, [projectsShow]);

  function toggleProjects() {
    setProjectsShow((previousValue) => !previousValue);
  }

  function setColorCounter() {
    const selectedColor = colorList[colorCounter];
    colorCounter += 1;
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
                  id={result[1]}
                  name={result[2]}
                  projectType={result[3]}
                  selectedColor={setColorCounter()}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <Button className="toggleButton" variant="success" onClick={toggleProjects}>
            Back to home
          </Button>
          <CreateProject toggleCallback={toggleProjects} />
        </div>
      )}
    </div>
  );
};

export default Home;
