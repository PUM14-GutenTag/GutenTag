import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CreateProject from '../components/CreateProject';
import Project from '../components/Project';
import Layout from '../components/Layout';
import HTTPLauncher from '../services/HTTPLauncher';
import { useUser } from '../contexts/UserContext';

import '../css/home.css';

const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

const Home = () => {
  const [projectsShow, setProjectsShow] = useState(true);
  const [projects, setProjects] = useState([]);
  const { state: userState } = useUser();

  const fetchData = async () => {
    const result = await HTTPLauncher.sendGetUserProjects();
    if (result.data !== undefined) {
      const dataArray = Object.values(result.data.projects);
      setProjects(dataArray);
    }
  };

  useEffect(() => {
    if (projectsShow) {
      fetchData();
    }
  }, [projectsShow]);

  const toggleProjects = () => {
    setProjectsShow((previousValue) => !previousValue);
  };

  return (
    <Layout title="Home">
      <div className="home-container">
        {projectsShow ? (
          <div className="projects-container">
            <Button className="toggleButton" variant="success" onClick={toggleProjects}>
              Create project
            </Button>
            <ul>
              {projects.map((result, i) => (
                <li key={result.name}>
                  <Project
                    id={result.id}
                    created={result.created}
                    name={result.name}
                    projectType={result.type}
                    selectedColor={colorList[i % colorList.length]}
                    showEditButton={userState.isAdmin}
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
    </Layout>
  );
};

export default Home;
