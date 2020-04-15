/*jshint esversion: 6 */

import * as d3 from 'd3';
import erpPlot from './erpPlot.js';
import createPlotConfig from './plotConfig.js';
import erpDataContainer from './erpDataContainer.js';
import redcapComs from './redcapComs.js';

import '../styles/main.css';

// Main script that mostly just sets everything up on a overall scale

// Hide div, it's just there in case we can't do anything
d3.select('body').select('#noScript').style('display','None');

// Create our data loader
var data = erpDataContainer();

// Margins for our plot, also we want some footer space
var footerHeight = 100;
var margin = {top: 10, right: 50, bottom: 30, left: 50};

// Create the svg element that will hold the fancy D3
var plotDiv = d3.select('body').append('div').attr('id','plotContainer');
d3.select('body').append('h2').attr('id','confTitle').text('Configuration: ');
var confDiv = d3.select('body').append('div').attr('id','configContainer');

// Create some of our objects with their divs
var mainPlot = erpPlot(plotDiv, margin, footerHeight);
var rc = redcapComs(confDiv.append('div').attr('id','redConf'));
var conf = createPlotConfig(confDiv, mainPlot);

// Set some callbacks to link the data and the plot
data.onNewERPFile = function(erp) {
  mainPlot.updateERP(erp);
};

data.onNewBin = function(bin) {
  data.clearPeaks();

  mainPlot.showBinData(bin);
  mainPlot.showPeaks([],[]);
  mainPlot.highlightDefault();
};

mainPlot.onHighlight = function(timeRange, polarity) {
  // Only want one set of peaks from this highlight
  data.clearTempPeaks();

  // Loop through all picked channels, pick peaks
  for(var i=0; i<mainPlot.pickChans.length; i++) {
    if(!mainPlot.pickChans[i]) continue;

    data.calcPeak(polarity, timeRange, i);
  }

  // Display peaks
  mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));
};

// We've ended our highlight dragging, keep the peaks we have
mainPlot.onDragEnd = function() {
  data.keepTempPeaks();
};

rc.onPost = function(response) {
  console.log(response);
  if(response.count && response.count > 0) {
    console.log("successful upload!");
    data.markUploaded(response.count);
  }
  // If we didn't get a positive count, retry
  else {
    rc.onQueueReady();
  }
};

rc.onQueueReady = function() {
  rc.sendPeaksToRedcap(data.getPeaksAsJSON());
};

// Create our browser button
// Make we get the files when they're chosen
var fileIn = plotDiv.append('div')
  .attr('id','fileIn')
  .append('input')
  .attr('type',"file")
  .attr("id","selectDir")
  .attr("name","fileList")
  .attr('webkitdirectory','true')
  .attr('multiple','true')
  .on('change',function(){
    console.log("loading Files");
    data.loadList(document.getElementById("selectDir").files);
  });

// This is called on space bar
var acceptAndNext = function() {
  // Accept / save our peaks
  data.savePeaks();

  // If we aren't already pending, send our peaks to redCap
  rc.sendPeaksToRedcap(data.getPeaksAsJSON());

  // move on
  data.nextBin();
};

// Add some button press functionality
d3.select('body')
  .on('keydown', function() {
    console.log(d3.event.keyCode);

    // Left Arrow
    if(d3.event.keyCode == 37){
      data.prevBin();

    // Right Arrow
    } else if(d3.event.keyCode == 39) {
      data.nextBin();
    }
    // Space Bar (accept + continue)
    else if(d3.event.keyCode == 32)
    {
      acceptAndNext();
    }
  });
