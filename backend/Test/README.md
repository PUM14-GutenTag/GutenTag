## Run automatic test before pushing

All terminal commands are expected to be run from the project's root folder. The first steps might be unnecessary if the packages are already installed.

Write the following commands in the terminal:

1. `python -m pip install --upgrade pip`
2. `pip install pytest`
3. `pip install -r backend/requirements.txt`
4. `pytest backend/Test/test_file.py`

The first three steps will install everything necessary and the fourth step will run all the tests in test_file.py.
