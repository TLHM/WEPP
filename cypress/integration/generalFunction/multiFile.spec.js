/// <reference types="cypress" />
/*jshint esversion: 6 */

context('multiFileLoading', () => {
  // Runs this before each test in our barrage
  beforeEach(() => {
    // Go to web page to test it
    cy.visit('.');

    // Loading 5 files
    const testFiles = [
      'testdata/example0.json',
      //'testdata/example1.json',
      // 'testdata/example2.json',
      // 'testdata/example3.json',
      'testdata/example4.json'
    ];

    // Fully load 5 files, takes a while
    // Doesn't work this way for normal function (loads one at a time)
    // But for testing I think you need to do it this way
    for(var i=0; i<testFiles.length; i++) {
      cy.get('#selectDir').addJSONFile(testFiles[i]);
      cy.wait(500);
    }
  });

  it('Shows 2 files in file selector', () => {
    cy.get('#fileNameSelect option')
      .should('have.length', 2);
  });

  it('Switches files on selection', () =>{
    cy.get('#fileNameSelect option')
      .should('have.length', 2);

    cy.get('#chanLines path')
      .first()
      .then(($line) => {
        const origPath = $line.attr('d');

        cy.get('#fileNameSelect')
          .select('example4.json');

        cy.get('#chanLines path')
          .first()
          .should('have.attr','d')
          .and('not.equal', origPath);
      });
  });

  it('Switches to next file via keypress', () => {
    cy.get('#binSelect option')
      .should('have.length', 3);

    cy.get('body')
      .type('{rightArrow}{rightArrow}{rightArrow}');

    cy.get('#binSelect')
      .should('have.value', '0');

    cy.get('#fileNameSelect')
      .should('have.value', '1');
  });


});
