/// <reference types="cypress" />
/*jshint esversion: 6 */

import * as d3 from 'd3';
import erpDataContainer from '../../../src/scripts/erpDataContainer.js';

context('erpDataContainer unit tests', () => {
  beforeEach(() => {
    // Create our data container
    var data = erpDataContainer();

    // Load our ERP file
    cy.fixture('testdata/example0.json').then(json => data.loadJSON(json));

    cy.wrap(data).as('data');
  });

  // In order to get the this.data from .as(), need to not use arrow notation for tests
  it('Calculates correct positive peak', function() {
    var peak = this.data.calcPeak(1, [130, 160], 124);
    cy.log(peak);
    expect(peak.latency).to.eq(144);
    expect(peak.amplitude.toFixed(2)).to.eq('16.76');
  });

  it("Doesn't find a positive peak", function() {
    var peak = this.data.calcPeak(1, [220, 240], 124);

    expect(peak.length).to.eq(0);
  });

  it('Calculates correct negative peak', function() {
    var peak = this.data.calcPeak(2, [220, 240], 124);
    cy.log(peak);
    expect(peak.latency).to.eq(230);
    expect(peak.amplitude.toFixed(2)).to.eq('2.98');
  });

  it("Doesn't find a negative peak", function() {
    var peak = this.data.calcPeak(2, [160, 180], 124);

    expect(peak.length).to.eq(0);
  });

  it("Handles plateau peak edge case", function() {
    // Modify our channel to have a tie
    this.data.curERP.bins[0].data[124][340] = this.data.curERP.bins[0].data[124][344];

    var peak = this.data.calcPeak(1, [130, 160], 124);
    console.log(peak);
    expect(peak.latency).to.eq(142);
    expect(peak.amplitude.toFixed(2)).to.eq('16.76');
  });

});
