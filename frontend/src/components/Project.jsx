import React, { useState } from 'react';
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import  HTTPLauncher from "../services/HTTPLauncher";
/*const HTTPLauncher = require('../services/HTTPLauncher');*/

function Project() {
    // eslint-disable-next-line
    /*
    const [project, setProject] = useState([{name:"",type:""}])
*/
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("");

    const submitHandler = async (event) => {
        event.preventDefault();
        console.log("hej");
        /*
        setProject({
            name: event.target.name.value,
            type: event.target.type.value
        })
        */

        // eslint-disable-next-line
        console.log("Project Name: " + projectName + "Project Type: " + projectType);


        const responseProject = await HTTPLauncher.sendCreateProject(projectName, projectType);
        /*const responseProject2 = await HTTPLauncher.sendCreateProject(projectName, projectType);*/
        
        console.log(responseProject);
    }

    const registerAndLogin = async (event) => {
        event.preventDefault();
        // eslint-disable-next-line        
        const sendRegister = await HTTPLauncher.sendRegister("Oscar", "last_name", "emails", "passwords", true);
        // eslint-disable-next-line
        const responeLogin = await HTTPLauncher.sendLogin("emails", "passwords");
        const token = responeLogin.data.access_token;
        localStorage.setItem('gutentag-accesstoken', JSON.stringify(token));
        console.log(responeLogin);
    }
    

    return (
    <div className="project-container">
        <div>
            <Form onSubmit={submitHandler}>
                <Form.Group controlId="form.name">
                    <Form.Label>Project Name:</Form.Label>
                    <Form.Control 
                        type="text"
                        name="name" 
                        onChange={(event) => setProjectName(event.target.value)}    
                        placeholder="Project name"
                        required
                        />
                </Form.Group>
                <Form.Group controlId="form.select">  
                    <Form.Label>Select Project Type</Form.Label>
                    <Form.Control 
                        as="select"
                        name="type"
                        onChange={(event) => setProjectType(event.target.value)}    
                        >
                        <option value="1">Text classification</option>
                        <option value="2">Image classification</option>
                        <option value="3">Sequence to Sequence</option>
                        <option value="4">Sequence labeling</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group>   
                </Form.Group>
                <Button variant="primary" type="submit" >
                 Submit
                 </Button>
            </Form>
        </div>
        <Button onClick={registerAndLogin}>
            Login
        </Button>
    </div>
    );
}

export default Project;