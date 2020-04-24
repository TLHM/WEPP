##Dev Setup

For development, you will need node and npm installed. They should also be updated (node v12.16.2, npm 6.14.4).

Then, simply go to the directory in a terminal and run `npm install`, which will install the necessary packages for the project.

For development, a live server with live reload can be used to see how the page looks as you change it. Use the command `npm start` to run it, and to end it use `ctrl+c`.

The project uses webpack, along with babel, for things like running the dev server and creating a better production files. The setup was done with help from [this article](https://code.likeagirl.io/how-to-set-up-d3-js-with-webpack-and-babel-7bd3f5e20df7), though it is slightly outdated (eg need @babel/preset-env, not babel-preset-env, and "@babel/preset-env" for the presets in the .babelrc). The [documentation for webpack](https://webpack.js.org/concepts/) was also very helpful for setting up aspects of its functionality, and is recommended for anyone looking to understand what it does, and how to get it to do more.

To build the production version, use the command `npm run build`.

## Testing
WEPP uses [Cypress](https://cypress.io) for testing. It should be install as a development tool when you run npm install.

### General Guides
Test should ideally be focused on testing one thing. Sometimes that one thing is very narrow, but other times it could be a longer "use case" test, where the test mimics a normal person using the application. It is still important to isolate testing of functionality, so that what goes wrong doesn't spill over into other tests, etc.

For unit testing, tests should be all limited to testing a single function and making sure it's working as intended. Sometimes this does involved prep (loading in a file), but ideally the functions will be able to be tested in a focused manner.

For Test Driven Development, you write the test first, then provide the functionality in order to pass the test. Given quality tests, this helps you format your code in a modular and testable manner, as well as ensures you have one thing working before moving on to the next. A guide to TDD is out of the scope of this document, but there are many good resources on the matter.

### Writing a test
Tests are run in groups, based on files in the `cypress/integration/*` folders. Specs are Javascript (`.js`) files, and contain one or more tests in a `Context` of testing a particular area of the application. The general setup  for a spec file looks like this:  

~~~
/// <reference types="cypress" />
/*jshint esversion: 6 */

context('multiFileLoading', () => {
  // Runs this before each test in our barrage
  beforeEach(() => {
    // Anything to set up our tests, runs before each test
  });

  it('WHAT THIS TESTS', () => {
    cy.get('#title')
      .should('equal', 'My title);
  });

});
~~~

There are additional special functions that can run at pre-determined times, ie before / after your tests. See [documentation](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Hooks) for more details.

__Unit Tests__  
If you are writing unit tests for more direct checks on underlying functions, rather that integration tests that go through the user interfaces, you can directly import scripts for testing:

~~~
import myFunction from '../../../src/scripts/myScript';
~~~

Note that the path is relative to the spec file, and you don't need the `.js` file ending.

__Integration Tests__  
Most tests are likely to be integration tests, ie testing all the integrated parts through a web browser. For this, you will need to use `cy`'s various functions for interacting with the web page.

For starters, you'll need to visit the actual web page in order to test it. For any integration tests, it's thus handy to have the following in your `beforeEach`:

~~~
cy.visit('.');
~~~

Which will load the webpage. In this project, the baseUrl for cypress is configured to be `http://localhost:8080/`, where our server makes our webpage available. If we had additional pages, you would modify the url relative to the base in your visit parameter.

After visiting, you can interact with the web page, primarily by getting an HMTL node, and either doing something to it, or checking that it is a certain way. For example:

~~~
it('Updates bin selector', () => {
    cy.get('#binSelect option')
        .should('have.length', 3);
});
~~~

This test finds the element with the specified id, which is a drop down menu of bins in a loaded ERP, and finds all the options it has. Then, it makes sure that there are 3 of them.

For some of the actions you can take on DOM elements, see [this documentation](https://docs.cypress.io/guides/core-concepts/interacting-with-elements.html#Actionability), and for examples about selecting elements, see [this documentation](https://docs.cypress.io/api/commands/get.html#Examples). For more on assertions like `should`, check out [the intro guide](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Assertions) and for a list of _Chai_ assertions you can use, among others, check out [this list](https://docs.cypress.io/guides/references/assertions.html#BDD-Assertions).

### Running Tests

Once you've gotten your tests written, you'll have to run them! Note that since Cypress visits a web page through a browser, you'll have to have your development server running in order to test. This means you'll need two terminal windows (for simplest setup), one to run `npm start` and host the project locally, and another for cypress.

To run cypress, go to the project directory and use the command `npx cypress open`.

There will be a GUI window that opens, and you can select your spec file from the file list, and it'll run it's tests.

### Monkey Testing
You can do monkey testing with gremlins.js, to see how random input affects the app. This can be done by pressing `g` twice in rapid succession on the app page.

Note the at the moment, the gremlins break thanks to a bug in the gremlins code. If you manually edit the html to not include any `<input type="number>` elements, it will work as intended. Bug has been reported and will hopefully be fixed relatively soon.