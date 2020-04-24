/// <reference types="cypress" />
/*jshint esversion: 6 */

import * as d3 from 'd3';

context('singleFilePlusD3', () => {
  beforeEach(() => {
    // Go to the web page to test it
    cy.visit('.');

    const testFile = 'testdata/example0.json';

    // Load our ERP file
    cy.get('#selectDir').addJSONFile(testFile);
  });

  it('Displays the correct channel data', () => {
    cy.get("#bgLines path")
      .should('have.length', 124);

    cy.fixture('testdata/example0.json').then(chData => {
      cy.get("#bgLines path")
        .eq(50)
        .should(ch => {
          //cy.log(d3.select(ch.get(0)));
          expect(d3.select(ch.get(0)).data()[0]).to.deep.eq(chData.bins[0].data[50]);
        });
    });
  });

});
