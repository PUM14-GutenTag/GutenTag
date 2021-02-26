const getAboutUsLink = require('./index');

test('Returns about-us for english language', () => {
  expect(getAboutUsLink('en-US')).toBe('/about-us');
});
