import React, { useState, useEffect } from 'react';
import Project from '../components/Project';
import Layout from '../components/Layout';
import HTTPLauncher from '../services/HTTPLauncher';
import { useUser } from '../contexts/UserContext';

import '../css/home.css';

const colorList = ['#cdffff', '#e2d0f5', '#ffeacc'];

// Home page. All projects available on the system are shown to admin.
// A user is only shown projects they are authorized to.
const Home = () => {
  const [projects, setProjects] = useState([]);
  const { state: userState } = useUser();
  const [filter, setFilter] = useState('');

  // Fetches a users/admins projects from backend.
  const fetchData = async () => {
    const result = await HTTPLauncher.sendGetUserProjects();
    if (result.data !== undefined) {
      const dataArray = Object.values(result.data.projects);
      setProjects(dataArray);
    }
  };

  // Filters users based on projectname.
  const filterFunc = (project) => {
    return project.name.toUpperCase().indexOf(filter.toUpperCase()) > -1;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="Home">
      <div className="home-container">
        <input
          className="text"
          type="text"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          placeholder="Search for project..."
        />
        <div className="projects-container">
          <ul>
            {projects
              .filter((p) => filterFunc(p))
              .map((result, i) => (
                <li key={result.name}>
                  <Project
                    id={result.id}
                    created={result.created}
                    name={result.name}
                    projectType={result.type}
                    selectedColor={colorList[i % colorList.length]}
                    showEditButton={userState.isAdmin}
                    labelsPerDatapoint={result.labels_per_datapoint}
                    progress={result.progress}
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
