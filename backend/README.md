# Configuring your development environment

Python code shall be developed according to the [PEP8](https://pep8.org/) and [PEP257](https://www.python.org/dev/peps/pep-0257/) specifications.

These are enforced using the Flake8 linter and autopep8 formatter. Below are the steps to configure these in VSCode.

1. Install Visual Studio Code.
2. Install Python 3.9.1.
3. Start VSCode and open up the root folder.
4. Create your virtual environment and install the relevant dependencies.
   - Run `python -m venv .venv` if you're on Windows (`python3 -m venv .venv` on Linux/MacOS).
   - Press CTRL+SHIFT+P in VSCode.
   - Select "Python: Select Interpreter".
   - Select "Python 3.9.1 64-bit ('.venv').
   - Open the settings ( CTRL+. ).
   - Enable "Python > terminal: Activate Env in Current Terminal".
   - Your virtual environment should now be activated automatically when you open VSCode.
   - Run `pip install -r requirements.txt`.
5. Install the following VSCode extensions.
   - Python
6. Switch to the Flake8 linter.
   - Press CTRL+SHIFT+P in VSCode.
   - Select "Python: Select Linter".
   - Select "flake8".
