/*jshint esversion: 6 */

import * as d3 from 'd3';
import erpPlot from './erpPlot.js';
import createPlotConfig from './plotConfig.js';

import '../styles/main.css';

// Main script that mostly just sets everything up on a overall scale
d3.select('body').select('#noScript').style('display','None');

// Margins for our plot, also we want some footer space
var footerHeight = 100;
var margin = {top: 10, right: 50, bottom: 30, left: 50};

// Create the svg element that will hold the fancy D3
var plotDiv = d3.select('body').append('div').attr('id','plotContainer');
d3.select('body').append('h2').attr('id','confTitle').text('Configuration: ');
var confDiv = d3.select('body').append('div').attr('id','configContainer');

// Create an erpPlot using this element
var erp = erpPlot(plotDiv, margin, footerHeight);
var conf = createPlotConfig(confDiv, erp);

// Create our browser button
var fileIn = plotDiv.append('div')
  .attr('id','fileIn')
  .append('input');

fileIn.attr('type',"file")
  .attr("id","selectDir")
  .attr("name","fileList")
  .attr('webkitdirectory','true')
  .attr('multiple','true')
  .attr('onchange','loadFiles();');

// This is called when the browse button changes what it's got
function loadFiles() {
  console.log("loading Files");
  erp.loadList(document.getElementById("selectDir").files);
}

// Add some button press functionality
d3.select('body')
  .on('keydown', function() {
    console.log(d3.event.keyCode);

    // Left Arrow
    if(d3.event.keyCode == 37){
      erp.prevBin();

    // Right Arrow
    } else if(d3.event.keyCode == 39) {
      erp.nextBin();
    }
    // Space Bar (accept + continue)
    else if(d3.event.keyCode == 32)
    {
      erp.acceptAndNext();
    }
  });
