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
8. Install the Python dependencies.
   - Run `pip install -r ./backend/requirements.txt -r ./backend/requirements_dev.txt`
9. Install the JavaScript dependencies.
   - Run `(cd frontend && npm install)`
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
```

11. Restart VSCode.

## Starting the application

### Installing Docker

Docker is run through Docker Desktop on Windows & MacOS while Linux distributions run Docker Engine.

**Windows**

1. Follow the instructions [here](https://docs.docker.com/docker-for-windows/install-windows-home/).
2. It is recommended that you run Docker using Windows Subsystem for Linux (WSL). Instructions can be found [here](https://docs.docker.com/docker-for-windows/wsl/).

**MacOS**

Follow the instructions [here](https://docs.docker.com/docker-for-mac/install/).

**Linux**

Follow the instructions [here](https://docs.docker.com/engine/install/).

### Starting in development mode

**Launch Docker Desktop**. Then open the root directory in the terminal and run

`docker-compose up`

This will launch all of the services in different containers, install their dependencies and configure them to communicate on a local network.

If you get an error saying that the database does not exist. Try running `docker-compose down -v` and then starting docker-compose again.

The frontend should now be reachable at [http:localhost:3000/](http:localhost:3000/) and the backend at [http:localhost:5000/](http:localhost:5000/)

### Starting in production mode

Set your database configuration in the /.env.prod file.

Set your serve hostname in the /.env/ file.

**Launch Docker Desktop**. Then open the root directory in the terminal and run

`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`

This will launch all of the services in different containers, install their dependencies and configure them to communicate on a local network.

If you get an error saying that the database does not exist. Try running `docker-compose down -v` and then starting docker-compose again.

The frontend should now be reachable at your configured hostname. The frontend can be reached at ${SERVER_NAME}/ and the backend can be reached at ${SERVER_NAME}/api/

### Logging in

**A default admin user exists with the following credentials:**

email: admin@admin.com

password: password

## Testing

[Frontend testing instructions](frontend/src/tests/README.MD)

[Backend testing instructions](backend/Test/README.MD)

## Contributing

See [CONTRIBUTING.MD](/CONTRIBUTING.MD)
