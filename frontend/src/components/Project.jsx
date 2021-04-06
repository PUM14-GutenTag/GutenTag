import React, { useState } from 'react';
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import  HTTPLauncher from "../services/HTTPLauncher";
/*const HTTPLauncher = require('../services/HTTPLauncher');*/

function Project() {
    // eslint-disable-next-line
    const [project, setProject] = useState([{name:"",type:""}])

    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("");

    const submitHandler = async (event) => {
        event.preventDefault();
        console.log("hej");
        /*
        setProject({
            name: event.target.name.value,
            type: event.target.type.value
        })*/
        // eslint-disable-next-line
        
        /*const responseProject = await HTTPLauncher.sendCreateProject(project.name, project.type);*/
        const responseProject2 = await HTTPLauncher.sendCreateProject(projectName, projectType);
        
        console.log(responseProject2);
    }

    const registerAndLogin = async (event) => {
        event.preventDefault();
        console.log("hello there - obi wan kenobi")
        // eslint-disable-next-line        
        const sendRegister = await HTTPLauncher.sendRegister("Oscar", "last_name", "email", "password", true);
        // eslint-disable-next-line
        const responeLogin = await HTTPLauncher.sendLogin("email", "password");
        //const token = responeLogin.access_token;
        //localStorage.setItem('gutentag-accesstoken', token)
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
                        <option>Text classification</option>
                        <option>Image classification</option>
                        <option>Sequence to Sequence</option>
                        <option>Sequence labeling</option>
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