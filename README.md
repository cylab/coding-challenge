Mathias Henze Coding Challenge Solution
=

This is my solution for the coding challenge.

Basically I
- converted the sources to valid TypeScript
- added types where possible
- extracted the if-checks into a set of validation functions
- converted the CompanyRepository to be a service dependency
- converted the CustomerDataAccess to be a service dependency
- wrapped the challenge in a nodejs project
- added some tests in "./test" using mocha, chai and sinon
- scratched my head because of the creditLimit stuff ;-)<br>
  (see my comments marked with CLARIFICATON NEEDED in the code)

Initialize the project
-

```
npm install
```

Run the compiler
-

```
npm run tsc
```

Run the linter
-

```
npm run linter
```

Run the tests
-

```
npm test
```
