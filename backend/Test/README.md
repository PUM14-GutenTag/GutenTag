# Testing

## Adding test

After you are done writing a file that needs automatic testing you should include it in Test/test\_\*filename.py\*. Add tests that you seem are appropiate for the function and really challenge the code in it, such as edge cases. When naming the tests they should follow the naming convention of test\*function name\*.py or else pytest won't find it.

Basically you give the function you want to test some input and together with the `assert` statement you make sure that the input matches the expected output. When comparing to None, use `x is None` or `x is not None` rather than `x == None` or `x != None`

## Run automatic test before pushing

All terminal commands are expected to be run from the project's root folder.

1. Make sure that you are running the Docker containers beforehand.
2. Run `docker-compose run backend python -m pytest ./Test/ -s` in your terminal.

It will run all the tests in each of the files in the ./Test/ directory.

