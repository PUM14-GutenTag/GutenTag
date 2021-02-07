# TDDD96-Data_Labeling

This is a bachelors project which goal is to create a data labeling product. The students developong this are students at Linköpings universitet in Sweden.

## Styleguide

### Comment guidelines

#### Classes

Include a comment that explains the purpose and context of the class.

#### Functions

Include a comment for each function.

It is not required to list all arguments and the return value individually. Instead, incorporate them into the description.

Bad

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

Good

```javascript
// Returns the absolute value of the given number.
function abs(number) {
  /*...*/
}
```

### JavaScript

JavaScript code shall be developed according to the [AirBnB style guide](https://github.com/airbnb/javascript).

This is enforced using the ESLint linter and Prettier formatter. Install instructions are in the README in `/frontend`.

### Python

Python code shall be developed according to the [PEP8](https://pep8.org/) and [PEP257](https://www.python.org/dev/peps/pep-0257/) specifications.

These are enforced using the Flake8 linter and autopep8 formatter. Install instructions are in the README in `/backend`.
