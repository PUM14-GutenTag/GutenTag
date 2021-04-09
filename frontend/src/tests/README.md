# Testing

## Adding test

After you are done writing a function that needs automatic testing you should include it in file.test.js. Add tests that you seem are appropiate for the function and really challenge the code in it, such as edge cases.

There are a test example in the test file. Follow the convention of that test for the tests that you will write. The test example is using the toBe() matcher. Follow this link to see more matchers https://jestjs.io/docs/en/using-matchers.

## Use functions from another file

You must declare a variable if
a function you want to use is in a file that haven't been
assigned to any variable yet.
For example if the function you want to use is named "diff"
and is in frontend/src/test.js. Then you will have to define
a variable like this:

`const testing = require('./src/test)`

And the test might look like this:

`test('Subtracts 2 - 1 to equal 1', () => {`
` expect(testing.diff(2, 1)).toBe(1);`
`});`

And a last step for this to work is that "diff" must be included
in test.js module.exports.

## Run automatic test before pushing

All terminal commands are expected to be run from the project's root folder.

1. Make sure that you are running the Docker containers beforehand.
2. Run `docker-compose run frontend npm test` in your terminal.

It will run all tests meeting the following [filename conventions](https://create-react-app.dev/docs/running-tests/#filename-conventions):

- Files with .js suffix in \_\_tests\_\_ folders.
- Files with .test.js suffix.
- Files with .spec.js suffix.
