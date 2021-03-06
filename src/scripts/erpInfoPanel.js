/* jshint esversion: 6 */

/**
  Responsible for displaying info about the current loaded ERP, bin
  Acts as a way to change some aspects as well, eg select a file, add notes
*/

import * as d3 from 'd3';

export default function erpInfoPanel(selection) {
  var panel = {
    selection: selection,
  };

  // Progress bar
  var progContainer = panel.selection.append('div')
    .attr('id', 'progContainer')
    .style('display','flex');
  var progLabel = progContainer.append('div')
    .attr('id','progressLabel');
  var progBG = progContainer.append('div')
    .attr('id', 'progressBG');
  var progBar = progBG.append('div')
    .attr('id', 'progressBar')
    .style('width', '0%');

  // Set up the File Name and Bin selection / display
  panel.selection.append('div').attr('id','fileBin');
  panel.fileSelect = panel.selection.select('#fileBin').append('select')
    .attr('id','fileNameSelect');
  panel.fileSelect.append('option').text("No File Loaded");

  panel.binSelect = panel.selection.select('#fileBin').append('select')
    .attr('id','binSelect');
  panel.binSelect.append('option').text("Bin: None");

  // Setters for the selectors
  panel.setFiles = function(fileList) {
    panel.fileSelect.selectAll('option')
      .data(fileList)
      .join('option')
        .attr('value', (d, i) => i)
        .text(d => d.name);
  };

  panel.setBins = function(binNames, binSelection) {
    if(!binSelection) binSelection = binNames.map(d => true);

    panel.binSelect.selectAll('option')
      .data(binNames)
      .join('option')
        .attr('value', (d, i) => i)
        .text(d => d)
        .attr('disabled', (d,i) => binSelection[i] ? null : 'true');
  };

  // Callbacks for when file, bin are selected
  panel.onFileSel = function(callback) {
    panel.fileSelect.on('change', callback);
  };
  panel.onBinSel = function(callback) {
    panel.binSelect.on('change', callback);
  };

  // Select a specific file / bin
  panel.selectFile = function(index) {
    panel.fileSelect.property('value',''+index);
  };

  panel.selectBin = function(index) {
    panel.binSelect.property('value',''+index);
  };

  // Good / bad trial count
  var trialCount = panel.selection.append('div')
    .attr('id', 'trialCount')
    .style('margin-right','10px');
  var trialLabels = trialCount.append('div').attr('id', 'trialLabels')
    .style('display','flex');
  var goodLabel = trialLabels.append('div')
    .attr('id','goodCount')
    .attr('class', 'trialLabel');
  var badLabel = trialLabels.append('div')
    .attr('id', 'badCount')
    .attr('class', 'trialLabel');
  var trialBar = trialCount.append('div')
    .attr('id','trialBar');
  var goodBar = trialBar.append('div')
    .attr('id','goodBar')
    .style('width', '100%');

  panel.setProgress = function( percent ) {
    progLabel.text((percent*100).toFixed(1)+'%');
    progBar.style('width', (percent*100).toFixed(2)+'%');
  };

  panel.setTrials = function( good, bad ){
    const total = good + bad;
    goodLabel.text(good+' Good Trials');
    badLabel.text(bad+' Bad Trials');

    goodBar.style('width', ((good/total)*100).toFixed(2)+'%');
  };

  // Channel diaply and selection
  var chanVis = panel.selection.append('div').attr('id','chanVis');
  var chanSVG = chanVis.append('svg').attr('id', 'chanSVG')
    .attr('viewBox','-10 -12 24 24');
  var chanLabel = chanVis.append('div').attr('id','chanLabel');

  panel.deg2rad = function(degrees) {
    return degrees * Math.PI / 180;
  };

  panel.onHover = function(i) {
    console.log("Started hovering over "+i);
  };

  panel.onExitHover = function(i) {
    console.log("No longer hovering over "+i);
  };

  panel.onClick = function(d, i) {
    console.log('Clicked on '+i);
  };

  var origR, origFill, hoverID;
  // Create Event Handlers for mouse
  panel.handleMouseOver = function(d, i) {  // Add interactivity
    // Use D3 to select element, change color and size
    //console.log(this);
    origR = d3.select(this).attr('r');
    origFill = d3.select(this).attr('fill');
    hoverID = i;
    d3.select(this).attr('r',0.6).attr('fill','#177AFD');

    // Specify where to put label of text
    chanLabel.text(d);

    // Let others know if they want to
    panel.onHover(i);
  };

  panel.handleMouseOut = function(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
      .attr('r', origR)
      .attr('fill', origFill);

    // Select text by id and then remove
    chanLabel.text('');  // Remove text location

    // Let others know if they want to
    panel.onExitHover(i);

    hoverID = -1;
  };

  // Show the various channels
  panel.displayChannels = function(sel, names, locs){
    //console.log(names);
    chanSVG.selectAll('circle').data(names).join('circle')
      .attr('cx', function(d,i){
        if(i>=locs.length){
          return 10;
        }
        return Math.cos(panel.deg2rad(locs[i][0]))*locs[i][1]*13;
      })
      .attr('cy', function(d,i){
        if(i>=locs.length){
          return -5 + (i-locs.length)*1.5;
        }
        return Math.sin(panel.deg2rad(locs[i][0]))*locs[i][1]*13;
      })
      .attr('r', '.45')
      .attr('fill', (d,i) => sel.includes(i) ? '#013375' : 'white')
      .attr('stroke', (d,i) => sel.includes(i) ? '#013375' : 'black')
      .attr('stroke-width', (d,i) => sel.includes(i) ? '0.15' : '0.1')
      .on("mouseover", panel.handleMouseOver)
      .on("mouseout", panel.handleMouseOut)
      .on('click', panel.onClick);

    // If we were hovering, keep that going
    if(hoverID >= 0){
      chanSVG.selectAll('circle').each(function(d,i){
        if(i!=hoverID) return;

        origR = d3.select(this).attr('r');
        origFill = d3.select(this).attr('fill');
        d3.select(this).attr('r',0.6).attr('fill','orange');

        // Specify where to put label of text
        chanLabel.text(d);

        // Let others know if they want to
        panel.onHover(i);
      });
    }
  };


  // Notes Per bin
  panel.selection.append('div').attr('id','notesTitle')
    .text('Notes:')
    .attr('class','configPrompt');
  panel.notesInput = panel.selection.append('textarea')
    .attr('id', 'notesBox')
    .attr('rows','3');

  panel.getNotes = function() {
    return panel.notesInput.property('value');
  };

  return panel;
}
