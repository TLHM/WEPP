// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import 'cypress-file-upload';

// from https://github.com/abramenal/cypress-file-upload/issues/175
Cypress.Commands.add(
    "addJSONFile",
    {
        prevSubject: true,
    },
    (subject, filePath) => {
        cy.fixture(filePath, 'binary').then((fileContent) => {
            cy.wrap(subject).attachFile(
                {
                    fileContent: new Blob([JSON.stringify(fileContent, null, 2)], {
                        type: 'application/json',
                    }),
                    filePath: filePath,
                    encoding: 'utf-8',
                },
                { subjectType: 'input' }
            );
        });
    }
);
