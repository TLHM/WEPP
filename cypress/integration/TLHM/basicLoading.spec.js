/// <reference types="cypress" />
/*jshint esversion: 6 */

context('basicLoading', () => {
  beforeEach(() => {
    cy.visit('.');

    const testFiles = [
      'testdata/example0.json',
      'testdata/example1.json',
      'testdata/example2.json',
      'testdata/example3.json',
      'testdata/example4.json'
    ];

    for(var i=0; i<testFiles.length; i++) {
      cy.get('#selectDir').addJSONFile(testFiles[i]);
    }
  });

  it('Loads files', () => {
    // https://on.cypress.io/_
    cy.get('#fileNameSelect option')
      .should('have.length', 5);
  });
})
