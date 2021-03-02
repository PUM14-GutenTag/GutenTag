/* This test file contains all the unit tests that will be
executed everytime someone makes a pull request or
pushes to the main branch.
*/

function sum(a, b) {
  return a + b;
}

/* Example test: sum(1, 2) == 3 is correct so this
 test will pass.
*/

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
