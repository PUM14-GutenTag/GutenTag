import React, { useState, useEffect } from 'react';
import CreateProject from "../components/CreateProject"
import Project from "../components/Project"
import HTTPLauncher from "../services/HTTPLauncher";
import "../css/home.css"

function Home() {
  const [ projectsShow, setProjectsShow ] = useState(true);
  const [ projects, setProjects ] = useState([])

  useEffect(() => {
    async function fetchData(){
      const result = await HTTPLauncher.sendGetUserProjects();
      setProjects(Object.values(result.data.projects))
    }
    fetchData()

  },[projectsShow]);

  function toggleProjects() {
    setProjectsShow(!projectsShow)
  }

  return (
    <div className="home-container">
      {projectsShow ? 
        <div>
          <h1> Your projects: </h1>
            <ul>{projects.map(result => <li key={result}><Project projectName={result}></Project></li>)}</ul>
          <div>
          </div>
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
