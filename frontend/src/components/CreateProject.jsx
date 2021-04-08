import React, { useState } from 'react';
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import  HTTPLauncher from "../services/HTTPLauncher";
/*const HTTPLauncher = require('../services/HTTPLauncher');*/

const Project = ({toggleCallback}) => {
    // eslint-disable-next-line
    /*
    const [project, setProject] = useState([{name:"",type:""}])
*/
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("");

    const submitHandler = async (event) => {
        event.preventDefault(); 
        console.log("hej");

        // eslint-disable-next-line
        console.log("Project Name: " + projectName + "Project Type: " + projectType);

        const responseProject = await HTTPLauncher.sendCreateProject(projectName, parseInt(projectType));
        console.log("responseproject", responseProject);
        const newResponse = await HTTPLauncher.sendAddNewData(1, 1, "hej");
        console.log("newresponse", newResponse);
        toggleCallback();
        
    }
    const register = async (event) => {
        event.preventDefault();

        const sendRegister = await HTTPLauncher.sendRegister("Oscar", "last_name", "email", "passwords", true);
        console.log("sendregister", sendRegister);
    }
    const login= async (event) => {
        event.preventDefault();
        console.log("Project Type: " + projectType);
        const responseLogin = await HTTPLauncher.sendLogin("email", "passwords");
        console.log(responseLogin);
        console.log("This is access token: " + responseLogin.data.access_token);
        localStorage.setItem('gutentag-accesstoken', responseLogin.data.access_token);
    }
    return (
    <div className="create-container">
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
                        defaultValue="1"  
                        >
                        <option value="1">Text classification</option>
                        <option value="2">Image classification</option>
                        <option value="3">Sequence to Sequence</option>
                        <option value="4">Sequence labeling</option>
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit" >
                 Submit
                 </Button>
                                     
            </Form>
        </div>
        <Button onClick={register}>
            Register
        </Button>
        <Button onClick={login}>
            Login
        </Button>
    </div>
    );
}

export default Project;