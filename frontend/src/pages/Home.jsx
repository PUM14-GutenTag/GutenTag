import React, { useState, useEffect } from 'react';
import Project from '../components/Project';
import Layout from '../components/Layout';
import HTTPLauncher from '../services/HTTPLauncher';
import { useUser } from '../contexts/UserContext';

import '../css/home.css';

const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

const Home = () => {
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
    fetchData();
  }, []);

  return (
    <Layout title="Home">
      <div className="home-container">
        <div className="projects-container">
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
      </div>
    </Layout>
  );
};

export default Home;
