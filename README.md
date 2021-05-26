# GutenTag

This is a bachelor's project with the goal to create a data labeling web app. The students developing this are students at Linköpings universitet in Sweden.

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

`docker-compose up`.

To rebuild the containers and then start, run

`docker-compose up --build`

This will launch all of the services in different containers, install their dependencies and configure them to communicate on a local network.

The frontend should now be reachable at [http:localhost:3000/](http:localhost:3000/) and the backend at [http:localhost:5000/](http:localhost:5000/)

### Starting in production mode

Set your database configuration in the /.env.prod file.

Set your serve hostname in the /.env/ file.

**Launch Docker Desktop**. Then open the root directory in the terminal and run

`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`.

To rebuild the containers and then start, run

`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build`

This will launch all of the services in different containers, install their dependencies and configure them to communicate on a local network.

The frontend should now be reachable at your configured hostname. The frontend can be reached at ${SERVER_NAME}/ and the backend can be reached at ${SERVER_NAME}/api/

### Common errors

if you get an error when upping the containers saying that the database does not exist. Try running `docker-compose down -v` and then starting docker-compose again.

If you've changed some database models, make sure to reset the database by accessing [http:localhost:5000/reset/](http:localhost:5000/reset/). Keep in mind that the reset endpoint is not reachable in production mode.

When running production, your code changes are not automatically applied, meaning you need to rebuild the docker images.

### Logging in

**A default admin user exists with the following credentials:**

email: admin@admin.com

password: password

## Testing

[Frontend testing instructions](frontend/src/tests/README.md)

[Backend testing instructions](backend/Test/README.md)

## Contributing

See [CONTRIBUTING.MD](/CONTRIBUTING.md)

## File upload formats

When uploading data, you need to provide JSON files with the following shape, where labels may be omitted.

### Document classification

```
[
   {
      "text": "Excellent customer service.",
      "labels": ["positive", "negative"]
   },
   ...
]
```

### Sequence labeling

```
[
   {
      "text": "Alex is going to Los Angeles in California",
      "labels": [
            [0, 3, "PER"],
            [16, 27, "LOC"],
            [31, 41, "LOC"]
            ]
   },
   ...
]
```

### Sequence to sequence labeling

```
[
   {
      "text": "John saw the man on the mountain with a telescope.",
      "labels": [
            "John såg mannen på berget med hjälp av ett teleskop.",
            "John såg mannen med ett teleskop på berget."
      ]
   },
   ...
]
```

### Image classification

Image projects expect a number of pictures along with a JSON that list the filenames and potential pre-labels.

```
[
   {
      "file_name": "image_name.jpeg",
      "labels": [
            [[442, 420], [530, 540], "car"],
            [[700, 520], [800, 640], "bus"]
      ]
   },
   ...
]
```

## File export formats

When exporting data, a JSON is provided in the following shapes.

### Document classification

```
{
   project_id: 0,
   project_name: "name",
   project_type: 1,
   data: [
      {
            "text": "Excellent customer service.",
            "labels": ["positive"]
      },
      ...
   ]
}
```

### Sequence labeling

```
{
   project_id: 0,
   project_name: "name",
   project_type: 2,
   data: [
      {
            "text": "Alex is going to Los Angeles in California",
            "labels": [
               [0, 3, PER],
               [16, 27, LOC],
               [31, 41, LOC]
            ]
      },
      ...
   ]
}
```

### Sequence to sequence labeling

```
{
   project_id: 0,
   project_name: "name",
   project_type: 3,
   data: [
      {
            "text": "John saw the man on the mountain with a telescope.",
            "labels": [
               "John såg mannen på berget med hjälp av ett teleskop.",
               "John såg mannen med ett teleskop på berget."
            ]
      },
      ...
   ]
}
```

### Image classification

When exporting image projects, a .zip file is provided containing all the images along with the JSON.

```
{
   project_id: 0,
   project_name: "project name",
   project_type: 4,
   data: [
      {
            "file_name": "image.jpg",
            "id": 101,
            "labels": [
               [[442, 420], [530, 540], "car"],
               [[700, 520], [800, 640], "bus"]
            ]
      },
      ...
   ]
}
```
