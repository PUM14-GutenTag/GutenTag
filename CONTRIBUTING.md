# Styleguide

## JavaScript

JavaScript code shall be developed according to the [AirBnB style guide](https://github.com/airbnb/javascript).

This is enforced using the ESLint linter and Prettier formatter. Install instructions can be found in [/frontend/README.md](/frontend/README.md).

## Python

Python code shall be developed according to the [PEP8](https://pep8.org/) and [PEP257](https://www.python.org/dev/peps/pep-0257/) specifications.

These are enforced using the Flake8 linter and autopep8 formatter. Install instructions can be found in [/backend/README.md](/backend/README.md).

## General documentation guidelines

The general documentation philosophy is to contextualize the code without explaining obvious concepts or being needlessly verbose.

> Everything should be made as simple as possible, but no simpler. ~ Albert Einstein.

### Classes

Include a comment that explains the purpose and context of the class.

### Functions

Include a comment for each function.

It is not required to list all arguments and the return value individually. Instead, incorporate them into the description.

**Bad**

```javascript
/**
 * Returns the absolute value of the given number.
 * number: The number to return the absolute value for.
 * return: The absolute value.
 */
function abs(number) {
  /*...*/
}
```

**Good**

```javascript
// Returns the absolute value of the given number.
function abs(number) {
  /*...*/
}
```
