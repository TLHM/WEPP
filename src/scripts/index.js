/*jshint esversion: 6 */

import * as gremlins from 'gremlins.js';
import * as d3 from 'd3';
import erpPlot from './erpPlot.js';
import createPlotConfig from './plotConfig.js';
import erpDataContainer from './erpDataContainer.js';
import redcapComs from './redcapComs.js';
import erpInfoPanel from './erpInfoPanel.js';

import '../styles/main.css';

// Main script that mostly just sets everything up on a overall scale

// Hide div, it's just there in case we can't do anything
d3.select('body').select('#noScript').style('display','None');

// Grab pointers to the overlay and pieces
var overlay = d3.select('#overlay').style('display','block');
var intro = d3.select('#intro');
var outro = d3.select('#outro').style('display', 'none');

// Create our data loader
var data = erpDataContainer();

// Margins for our plot, also we want some footer space
var margin = {top: 10, right: 25, bottom: 30, left: 50};

// Make holder for plot and the info panel to the right
var plotAndInfo = d3.select('body').append('div').attr('id','plotAndInfo')
  .style('display', 'flex');
var plotDiv = plotAndInfo.append('div').attr('id','plotContainer');

// Create the config div
var confContainer = d3.select('body').append('div').attr('id','configOuter');
confContainer.append('h2').attr('id','confTitle').text(' + Configuration: ');
var confDiv = confContainer.append('div').attr('id','configContainer');

// Make our info panel
var iPanel = erpInfoPanel(plotAndInfo.append('div').attr('id','infoPanel'));
iPanel.onFileSel(function(){
  data.selectFile(+d3.event.target.value);
});
iPanel.onBinSel(function(){
  data.selectBin(+d3.event.target.value);
});

// Create some of our objects with their divs
var mainPlot = erpPlot(plotDiv, margin);
var rc = redcapComs(confDiv.append('div').attr('id','redConf'));
var conf = createPlotConfig(confDiv);

// Add show/hide to container h2
confContainer.select('#confTitle').on('click', function(){
  d3.select(this).text((conf.visible ? ' +' : ' -')+' Configuration: ');
  conf.toggleVisibility();
});

// Make sure our plot resizes
window.addEventListener("resize", function(){
  mainPlot.resize();

  // Redraw our data
  if(data.curERP.bins){
    mainPlot.showBinData(data.getCurBinData(), data.getSelectedChans());
    mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));
  }
});

// Set some callbacks to link the data and the plot, etc.
conf.onChangeConfig = function(config) {
  rc.urlInput.attr('value', config.redcapURL);
  rc.tokenInput.attr('value', config.tokenURL);

  conf.showBins(data.getBinNames(), config.selectedBins);

  data.setConfig('selectedChannels', config.selectedChannels);
  if(config.selectedBinCount > 0) {
    data.setConfig('selectedBinCount', config.selectedBinCount);
    data.setConfig('selectedBins', config.selectedBins);

    iPanel.setBins(data.getBinNames(), config.selectedBins);

    if(!config.selectedBins[data.curBinIndex]) data.nextBin();
  }

  mainPlot.defaultTimeWindows = config.defaultWindows;
};

data.onConfigUpdate = function(config) {
  conf.updateSelectedChans(config.selectedChannels);
};

data.onFindConf = function(file) {
  conf.loadConfig(file);
};

data.onNewERPFile = function(erp) {
  mainPlot.updateERP(erp);

  iPanel.setBins(data.getBinNames(), data.config.selectedBins);
  iPanel.selectFile(data.curFileIndex);
  iPanel.selectBin(data.curBinIndex);

  conf.showBins(data.getBinNames());
};

data.onNewBin = function(bin, selectedChannels) {
  data.clearPeaks();
  data.checkForOldPeaks();
  // console.log(data.pickedPeaks);
  // console.log(data.getPickedPeaks());
  // console.log(data.getPickedPeaks(false));

  mainPlot.showBinData(bin, selectedChannels);
  mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));
  mainPlot.highlightDefault();

  iPanel.selectBin(data.curBinIndex);
};

data.onChanSelect = function(sel, names, locs) {
  iPanel.displayChannels(sel, names, locs);

  // Redraw our bin data
  mainPlot.showBinData(data.getCurBinData(), sel);
  mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));

  conf.updateSelectedChans(sel);
};

mainPlot.onHighlight = function(timeRange, polarity) {
  // Only want one set of peaks from this highlight
  data.clearTempPeaks();

  // Loop through all picked channels, pick peaks
  data.calcPeaks(polarity, timeRange);

  // Display peaks
  mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));
};

iPanel.onHover = function(chanIndex) {
  // Got to translate it into index for selected or non-selected
  var selLoc = data.getSelLoc(chanIndex);
  mainPlot.hoverChannel(selLoc);
};

iPanel.onExitHover = function(chanIndex) {
  // Got to translate it into index for selected or non-selected
  mainPlot.endHoverChannel();
};

iPanel.onClick = function(name, chanIndex) {
  mainPlot.endHoverChannel();
  data.toggleChannel(chanIndex);
};

// We've ended our highlight dragging, keep the peaks we have
mainPlot.onDragEnd = function() {
  data.keepTempPeaks();
};

mainPlot.onDeletePeak = function(p) {
  data.deletePeakByRecordID(p[0].record_id);

  // Display peaks
  mainPlot.showPeaks(data.getPickedPeaks(), data.getPickedPeaks(false));
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

rc.onChangeSettings = function() {
  conf.setConfig('redcapURL', rc.url);
  conf.setConfig('redcapToken', rc.token);
};

// Download button for the config
var buttonCol = confDiv.append('div').attr('id','buttonsCol');
var confDL = buttonCol.append('button').attr('id', 'dlConfig')
  .text('Save Configuration')
  .attr('class', 'dlButton')
  .on('click', function(){
    conf.saveConfig();
  })
  .attr('disabled', 'true');
buttonCol.append('br');
var loadConfLabel = buttonCol.append('label')
  .text("Load Config File")
  .attr('class', 'browseFileLabel configPrompt')
  .attr('for','upConfig')
  .style('height','20px')
  .style('margin','5px');
var loadConf = buttonCol.append('input').attr('id', 'upConfig')
  .attr('type',"file")
  .attr('accept','.json')
  .style('display','none')
  .text('Load Configuration')
  .on('change', function(){
    var files = document.getElementById("upConfig").files;
    if(files.length < 1) return;

    conf.loadConfig(files[0]);
  });
buttonCol.append('br');

// Download button for the peaks
var peakDL = buttonCol.append('button').attr('id', 'dlPeaks')
  .attr('class', 'dlButton')
  .text('Export Picked Peaks')
  .on('click', function(){
    data.exportToCSV();
  })
  .attr('disabled', 'true');

data.onGetPeaks = function(){
  peakDL.attr('disabled', null);
};

data.onEmptyPeaks = function(){
  peakDL.attr('disabled', 'true');
};

// Create our file browser button
// Make sure we get the files when they're chosen
var fileIn = intro.append('div')
  .attr('id','fileIn');
fileIn.append('label').attr('id', 'selDirLabel')
  .text("Browse")
  .attr('class', 'browseFileLabel')
  .attr('for','selectDir');
fileIn.append('input')
  .attr('type',"file")
  .attr("id","selectDir")
  .attr("name","fileList")
  .attr('webkitdirectory','true')
  .attr('multiple','true')
  .style('display','none')
  .on('change',function(){
    console.log("loading Files");
    console.log(document.getElementById("selectDir").files);
    data.loadList(document.getElementById("selectDir").files);
    iPanel.setFiles(data.fileList);
    //iPanel.setBins(['test','one','two']);

    confDL.attr('disabled',null);

    overlay.style('display','none');
  });


// This is called on space bar
var acceptAndNext = function() {
  // Grab our notes
  var notes = iPanel.getNotes();

  // Accept / save our peaks
  data.updateNotes(notes);
  data.savePeaks();

  // If we aren't already pending, send our peaks to redCap
  rc.sendPeaksToRedcap(data.getPeaksAsJSON());

  // move on
  data.nextBin();

  // Update our progress bar
  iPanel.setProgress(data.getProgress());
};

// Our gremlins
var horde = gremlins.createHorde();
var lastG = 0; // for double button press

// Add some button press functionality
d3.select('body')
  .on('keydown', function() {
    // Don't pick up inputs to text boxes
    if(d3.event.target != document.body) return;
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
      d3.event.preventDefault();
    }

    // g key, for testing gremlins
    else if(d3.event.keyCode == 71)
    {
      if(Date.now() - lastG < 1000){
        horde.unleash();
      }
      lastG = Date.now();
    }
  });
