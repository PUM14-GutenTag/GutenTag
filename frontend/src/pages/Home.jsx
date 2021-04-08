import React, { useState, useEffect } from 'react';
import CreateProject from "../components/CreateProject"
import Project from "../components/Project"
import HTTPLauncher from "../services/HTTPLauncher";
import "../css/home.css"

function Home() {
  const [ projectsShow, setProjectsShow ] = useState(false);
  const [ projects, setProjects ] = useState([1, 2, 3,4])

  useEffect(async () => {
    const result = await HTTPLauncher.sendGetUserProjects();
    console.log(result);
  })

  function toggleProjects() {
    setProjectsShow(!projectsShow)
  }

  return (
    <div className="home-container">
      {projectsShow ? 
        <div>
          <h1> Your projects: </h1>
          <ul>{projects.map(project => 
            <li><Project></Project></li>
          )}</ul>
          <button onClick={toggleProjects}>Create project</button>
        </div>
        :
        <div>
          <button onClick={toggleProjects}>Back to home</button>
          <CreateProject toggleCallback={toggleProjects}></CreateProject> 
        </div>
      }
    </div>
  );
}

export default Home;
