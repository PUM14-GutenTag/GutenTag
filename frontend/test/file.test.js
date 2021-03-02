/* This test file contains all the unit tests that will be
executed everytime someone makes a pull request or
pushes to the main branch.
*/
const testing = require('./testing');
// import { diff } from './testing';

function sum(a, b) {
  return a + b;
}

/* Example test: sum(1, 2) == 3 is correct so this
 test will pass.
*/

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('Subtracts 2 - 1 to equal 1', () => {
  expect(testing.diff(2, 1)).toBe(1);
});
