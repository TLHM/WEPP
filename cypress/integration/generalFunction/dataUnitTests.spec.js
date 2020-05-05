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

  it("Outputs JSON peaks for uploading", function(){
    this.data.calcPeaks(1, [100,200]);
    this.data.keepTempPeaks();
    this.data.savePeaks();

    expect(this.data.peakArchive[0].length).to.eq(3);
    expect(this.data.peakArchive[0][0].length).to.eq(2);
    const j = JSON.parse(this.data.getPeaksAsJSON());
    expect(j.length).to.eq(2);
  });

  it("Properly fills in the Archive", function(){
    // Picks first file
    for(var i=0; i< 3; i++) {
      this.data.calcPeaks(1, [100,200]);
      this.data.keepTempPeaks();
      this.data.savePeaks();
      this.data.curBinIndex += 1;
      this.data.clearPeaks();
    }
    console.log(this.data.peakArchive);
    expect(this.data.peakArchive.length).to.eq(1);
    expect(this.data.peakArchive[0].length).to.eq(3);
    expect(this.data.peakArchive[0][0].length).to.eq(2);
  });

  it("Doesn't redo JSON peaks for uploading", function(){
    // Picks first file
    for(var i=0; i< 3; i++) {
      this.data.calcPeaks(1, [100,200]);
      this.data.keepTempPeaks();
      this.data.savePeaks();
      this.data.curBinIndex += 1;
      this.data.clearPeaks();
    }

    // Mock upload first file
    const up1 = this.data.getUpload();
    this.data.markUploaded(1);

    expect(this.data.uploadedCount).to.eq(1);
    console.log(this.data.peakArchive);
    console.log(up1);

    // Load file 2
    cy.fixture('testdata/example1.json').then(json => {
      this.data.curFileIndex = 1;
      this.data.curBinIndex = 0;

      this.data.loadJSON(json);

      // Picks first bin of file 2
      this.data.calcPeaks(1, [100,200]);
      this.data.keepTempPeaks();
      this.data.savePeaks();

      console.log(this.data.peakArchive);

      // Make sure our upload now only includes file 2
      const j2 = JSON.parse(this.data.getUpload());
      console.log(j2);
      expect(j2.length).to.eq(2);
    });
  });

  it.only("Includes modified peaks for uploading", function(){
    // Picks first file
    for(var i=0; i< 3; i++) {
      this.data.calcPeaks(1, [100,200]);
      this.data.keepTempPeaks();
      this.data.savePeaks();
      this.data.curBinIndex += 1;
      this.data.clearPeaks();
    }

    // Mock upload first file
    const up1 = this.data.getUpload();
    this.data.markUploaded(1);

    expect(this.data.uploadedCount).to.eq(1);
    console.log(this.data.peakArchive);
    console.log(up1);

    // Mock load file 2
    this.data.curFileIndex = 1;
    this.data.curBinIndex = 0;

    // Picks first bin of file 2
    this.data.calcPeaks(1, [100,200]);
    this.data.keepTempPeaks();
    this.data.savePeaks();

    this.data.clearPeaks();

    // Change peaks again in file 1
    this.data.curFileIndex = 0;

    this.data.checkForOldPeaks();
    this.data.calcPeaks(2,[200,300]);
    this.data.keepTempPeaks();
    this.data.savePeaks();

    console.log(this.data.peakArchive);

    // Make sure our upload now includes the 2 new, plus all the peaks in file1,bin0
    const j2 = JSON.parse(this.data.getUpload());
    console.log(j2);
    expect(j2.length).to.eq(6);
  });

});
