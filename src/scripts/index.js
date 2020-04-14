/*jshint esversion: 6 */

import * as d3 from 'd3';
import erpPlot from './erpPlot.js';
import createPlotConfig from './plotConfig.js';
import erpDataContainer from './erpDataContainer.js';

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

// Create an erpPlot using this element
var mainPlot = erpPlot(plotDiv, margin, footerHeight);
var conf = createPlotConfig(confDiv, mainPlot);

// Set some callbacks to link the data and the plot
data.onNewERPFile = function(erp) {
  mainPlot.updateERP(erp);
};

data.onNewBin = function(bin) {
  mainPlot.showBinData(bin);
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
  //plot.savePeaks();

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
