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

  panel.setBins = function(binNames) {
    panel.binSelect.selectAll('option')
      .data(binNames)
      .join('option')
        .attr('value', (d, i) => i)
        .text(d => d);
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

  return panel;
}
