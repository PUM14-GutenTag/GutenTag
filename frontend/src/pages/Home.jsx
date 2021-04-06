import React, { useState} from 'react';
import Project from "../components/Project"


function Home() {
  const [ projectsShow, setProjectsShow ] = useState(true);

  function toggleProjects() {
    setProjectsShow(!projectsShow)
  }

  return (
    <div className="home-container">
      {projectsShow ? 
        <div>
        <h1> Home </h1>
        <button onClick={toggleProjects}>Create project</button>
        </div>
        :
        <div>
          <button onClick={toggleProjects}>Back to home</button>
          <Project></Project> 
        </div>
      }
    </div>
  );
}

export default Home;
