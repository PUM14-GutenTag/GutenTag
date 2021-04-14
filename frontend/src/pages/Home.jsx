import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CreateProject from '../components/CreateProject';
import Project from '../components/Project';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/home.css';

const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

const Home = () => {
  const [projectsShow, setProjectsShow] = useState(true);
  const [projects, setProjects] = useState([]);
  let colorCounter = 0;

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

  const toggleProjects = () => {
    setProjectsShow((previousValue) => !previousValue);
  };

  const setColorCounter = () => {
    const selectedColor = colorList[colorCounter];
    colorCounter === colorList.length - 1 ? (colorCounter = 0) : (colorCounter += 1);

    return selectedColor;
  };

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
