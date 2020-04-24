/// <reference types="cypress" />
/*jshint esversion: 6 */

context('singleFileLoading', () => {
  beforeEach(() => {
    // Go to the web page to test it
    cy.visit('.');

    const testFile = 'testdata/example0.json';

    // Load our ERP file
    cy.get('#selectDir').addJSONFile(testFile);
  });

  it('Updates file selector', () => {
    cy.get('#fileNameSelect option')
      .should('have.length', 1);
  });

  it('Updates bin selector', () => {
    cy.get('#binSelect option')
      .should('have.length', 3);
  });

  it('Displays 126 channels', () => {
    cy.get("#chanSVG circle")
      .should('have.length', 126);
  });

  it('Displays 124 background channels', () => {
    cy.get("#bgLines path")
      .should('have.length', 124);
  });

  it('Displays 2 selected channels', () => {
    cy.get("#chanLines path")
      .should('have.length', 2)
      .each((d,i) => {
        cy.wrap(d).should('have.class','lineType'+i);
      });
  });

  it('Can select and display positive peaks', () => {
    // Make sure we have some chans displaying
    cy.get("#chanLines path")
      .should('have.length', 2);

    cy.get('#plotSVG')
      .click('center');

    cy.get('#posPeaks circle')
      .should('have.length', 2);
  });

  it('Can select and display negative peaks', () => {
    // Make sure we have some chans displaying
    cy.get("#chanLines path")
      .should('have.length', 2);

    cy.get('#plotSVG')
      .then(($svg) => {
        const w = $svg.width();

        cy.get('#plotSVG')
          .rightclick(w*0.62, 100);

        cy.get('#negPeaks circle')
          .should('have.length', 2);
      });
  });

  it('Highlights normal channel circle on hover', () => {
    cy.get("#chanSVG circle")
      .should('have.length', 126)
      .first()
      .should('have.attr','fill')
      .and('equal','white');

    cy.get("#chanSVG circle")
      .first()
      .trigger('mouseover')
      .should('have.attr','fill')
      .and('equal','orange');

    cy.get("#chanSVG circle")
      .first()
      .trigger('mouseout')
      .should('have.attr','fill')
      .and('equal','white');
  });

  it('Highlights selected channel circle on hover', () => {
    cy.get("#chanSVG circle")
      .should('have.length', 126)
      .last()
      .should('have.attr','fill')
      .and('equal','rgb(118, 182, 228)');

    cy.get("#chanSVG circle")
      .last()
      .trigger('mouseover')
      .should('have.attr','fill')
      .and('equal','orange');

    cy.get("#chanSVG circle")
      .last()
      .trigger('mouseout')
      .should('have.attr','fill')
      .and('equal','rgb(118, 182, 228)');
  });

  it('Switches bins', () => {
    cy.get('#binSelect option')
      .should('have.length', 3);

    cy.get('#chanLines path')
      .first()
      .then(($line) => {
        const origPath = $line.attr('d');

        cy.get('#binSelect')
          .select('Fixation');

        cy.get('#chanLines path')
          .first()
          .should('have.attr','d')
          .and('not.equal', origPath);
      });
  });

  it('Switches to next bin via keypress', () => {
    cy.get('#binSelect option')
      .should('have.length', 3);

    cy.get('#chanLines path')
      .first()
      .then(($line) => {
        const origPath = $line.attr('d');

        cy.get('body')
          .type('{rightArrow}');

        cy.get('#chanLines path')
          .first()
          .should('have.attr','d')
          .and('not.equal', origPath);

        cy.get('#binSelect')
          .should('have.value', '1');
      });
  });

  it('Switches to prev bin via keypress', () => {
    cy.get('#binSelect option')
      .should('have.length', 3);

    cy.get('#binSelect')
      .select('Fixation');

    cy.get('#binSelect')
      .should('have.value', '2');

    cy.get('#chanLines path')
      .first()
      .then(($line) => {
        const origPath = $line.attr('d');

        cy.get('body')
          .click()
          .type('{leftArrow}');

        cy.get('#binSelect')
          .should('have.value', '1');

        cy.get('#chanLines path')
          .first()
          .should('have.attr','d')
          .and('not.equal', origPath);
      });
  });


});
