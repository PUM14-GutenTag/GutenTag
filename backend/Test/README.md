# Testing

## Adding test

After you are done writing a function that needs automatic testing you should include it in test*file.py. Add tests that you seem are appropiate for the function and really challenge the code in it, such as edge cases. When naming the tests they should follow the naming convention of test*_function name_.py or else pytest won't find it.

There are a test example in the test file. Basically you give the function you want to test some input and together with the `assert` statement you make sure that the input matches the expected output.

## Run automatic test before pushing

All terminal commands are expected to be run from the project's root folder.

Write the following command in the terminal:

1. `pytest backend/test/test_file.py`

It will run all the tests in test_file.py.
