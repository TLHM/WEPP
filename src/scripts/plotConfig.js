/*jshint esversion: 6 */

/**
  Collects a bunch of configuration settings for our plot and peak picking
  Input is a div that holds or will hold all our input boxes, etc.
  We also want a pointer to the plot so we can update it
*/

import downloadBlob from './blobDL.js';

export default function createPlotConfig(myDiv)
{
  var conf = {
    body: myDiv,
    config: {
      redcapURL: 'https://poa-redcap.med.yale.edu/api/',
      redcapToken: '',
      selectedChannels: [],
      defaultWindows: [],
      selectedBins: [],
      selectedBinCount: [],
    }
  };

  // For setting default time windows
  var timeDiv = conf.body.append('div').attr('id','defaultTimes');
  // Positive peak default time window
  timeDiv.append('p').attr('class','configPrompt')
    .attr('id','posTWPrompt').text("Default Positive Time Window (ms):");

  conf.posTwInput0 = timeDiv.append('input').attr('id','posTwIn0')
    .attr('class','twInput')
    .attr('type', 'number');
  timeDiv.append('p').attr('class','twSpacer').text(':');
  conf.posTwInput1 = timeDiv.append('input').attr('id','posTwIn1')
    .attr('class','twInput')
    .attr('type', 'number');

  // Negative peak default time window
  timeDiv.append('p').attr('class','configPrompt')
    .attr('id','negTWPrompt').text("Default Negative Time Window (ms):");

  conf.negTwInput0 = timeDiv.append('input').attr('id','negTwIn0')
    .attr('class','twInput')
    .attr('type', 'number');
  timeDiv.append('p').attr('class','twSpacer').text(':');
  conf.negTwInput1 = timeDiv.append('input').attr('id','negTwIn1')
    .attr('class','twInput')
    .attr('type', 'number');


  // Loads a specified config file
  conf.loadConfig = function(confFile) {
      var confReader = new FileReader();
      confReader.onload = function(event){
          console.log(event.target.result)
          conf.config = JSON.parse(event.target.result);
          conf.onChangeConfig(conf.config);

          conf.setWindows();
      };
      confReader.readAsText(confFile);
  };

  // Callback for when we load in a new configuration file
  conf.onChangeConfig = function(config) {
      console.log('Loaded Config File');
  };

  // Function to update the config
  conf.setConfig = function(key, value) {
      conf.config[key] = value;

      conf.onChangeConfig(conf.config);
  };

  // Saves the config file (pops up dialog)
  conf.saveConfig = function() {
      const confBlob = new Blob([JSON.stringify(conf.config)], {type:'application/plsdl'});

      downloadBlob(confBlob, 'wepp_conf.json');
  };

  // Update the defaults in our plot, called on change of input fields
  conf.updateDefaultTimeWindows = function()
  {
    var windows = [];

    if(conf.posTwInput0.property("value") && conf.posTwInput1.property("value"))
    {
      windows.push({
        range: [+conf.posTwInput0.property("value"),+conf.posTwInput1.property("value")],
        type: 'pos'
      });
    }

    if(conf.negTwInput0.property("value") && conf.negTwInput1.property("value"))
    {
      windows.push({
        range: [+conf.negTwInput0.property("value"),+conf.negTwInput1.property("value")],
        type: 'neg'
      });
    }

    conf.config.defaultWindows = windows;
    conf.onChangeConfig(conf.config);
  };
  conf.posTwInput0.on('input', conf.updateDefaultTimeWindows);
  conf.posTwInput1.on('input', conf.updateDefaultTimeWindows);
  conf.negTwInput0.on('input', conf.updateDefaultTimeWindows);
  conf.negTwInput1.on('input', conf.updateDefaultTimeWindows);

  // For loading in windows
  conf.setWindows = function(){
    for(var i=0; i < conf.config.defaultWindows.length; i++){
      if(conf.config.defaultWindows[i].type === 'pos') {
        conf.posTwInput0.property('value', conf.config.defaultWindows[i].range[0]);
        conf.posTwInput1.property('value', conf.config.defaultWindows[i].range[1]);
      } else {
        conf.negTwInput0.property('value', conf.config.defaultWindows[i].range[0]);
        conf.negTwInput1.property('value', conf.config.defaultWindows[i].range[1]);
      }
    }
  };

  conf.updateSelectedChans = function(sel) {
    conf.config.selectedChannels = sel;
  };

  return conf;
}
