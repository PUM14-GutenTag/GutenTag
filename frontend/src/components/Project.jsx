import React, { useState } from 'react';
import "../css/project.css"
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar'

function Project () {
    const [ showInfo, setShowInfo ] = useState(false)

    const toggleInfo = () => {
        setShowInfo(!showInfo)
    }

    return (
        <div className="project-container" onClick={toggleInfo}>
            <div >
                <div>
                    <h1>Project Name</h1>
                </div>
                <div className="progress-bar-project">
                    <ProgressBar animated now={75} striped variant="danger"  />
                </div>
            </div>
            {showInfo ? 
                <div className="projectInfo" >
                    <div className="left-info">
                    <p>Type: Text Classification</p>
                    <p>Progress: 1/4 </p>
                    <p>Started: 2020-01-14 </p>
                    <Button variant="outline-primary">Start</Button>
                    </div>
                    
                </div>
            :
            null
            }

        </div>
    )
}
export default Project