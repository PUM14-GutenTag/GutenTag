# GutenTag

This is a bachelors project which goal is to create a data labeling product. The students developong this are students at Linköpings universitet in Sweden.

## Configuring your development environment

All terminal commands are expected to be run from the project's root folder.

1. Install [Visual Studio Code](https://code.visualstudio.com/download).
2. Install Python version [3.9.1](https://www.python.org/downloads/release/python-391/).
3. Install NodeJS version [15.0.0 or later](https://nodejs.org/en/download/current/).
4. Install the following VSCode extensions.
   - Python
   - ESLint
   - Prettier
5. Open the VSCode settings (CTRL + ,).
6. Search for "Format On Save" and enable it.
7. Create a virtual environment and select your Python interpreter.
   - If you're on Windows, run `python -m venv .venv` On Linux/MacOS run `python3 -m venv .venv`
   - Press CTRL+SHIFT+P in VSCode.
   - Select "Python: Select Interpreter".
   - Select "Python 3.9.1 64-bit ('.venv').
   - Open the settings (CTRL + ,).
   - Enable "Python > terminal: Activate Env in Current Terminal".
   - Your virtual environment should now be activated automatically when you open VSCode.
8. Install the Python **dev** dependencies.
   - Run `pip install -r ./backend/requirements_dev.txt`
9. Install the Javascript **dev** dependencies.
   - Run `(cd frontend && npm install --only=dev)`
10. Add the following settings to your /.vscode/settings.json file. This enables the Flake8 linter as well as format on save for javascript.

```
{
    // ...
    // ... other options
    // ...
    "python.linting.flake8Enabled": true,
    "python.linting.enabled": true,

    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "eslint.validate": ["javascript"],
}

11. Restart VSCode.
```

## Starting the application for debugging

### Installing Docker

Docker is run through Docker Desktop on Windows & MacOS while Linux distributions run Docker Engine.

**Windows**

1. Follow the instructions [here](https://docs.docker.com/docker-for-windows/install/).
2. It is recommended that you run Docker using Windows Subsystem for Linux (WSL). Instructions can be found [here](https://docs.docker.com/docker-for-windows/wsl/).

**MacOS**

Follow the instructions [here](https://docs.docker.com/docker-for-mac/install/).

**Linux**

Follow the instructions [here](https://docs.docker.com/engine/install/).

### Running the Docker containers

Launch Docker Desktop. Then open the root directory in the terminal and run

`docker-compose up`

This will launch all of the services in different containers, install their dependencies and configure them to communicate on a local network.

The frontend should now be reachable at [http:localhost:3000/](http:localhost:3000/) and the backend at [http:localhost:5000/](http:localhost:5000/)
