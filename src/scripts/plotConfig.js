/*jshint esversion: 6 */

/**
  Collects a bunch of configuration settings for our plot and peak picking
  Input is a div that holds or will hold all our input boxes, etc.
  We also want a pointer to the plot so we can update it
*/

export default function createPlotConfig(myDiv, plot)
{
  var conf = {
    plot: plot,
    body: myDiv
  };


  // Create our redcap conection input boxes
  var red = conf.body.append('div').attr('id', 'redcap');
  red.append('p').attr('class','configPrompt')
    .attr('id','apiPrompt').text("Redcap API URL:");

  conf.urlInput = red.append('input').attr('type', 'url')
    .attr('id','apiInput')
    .attr('class','redcapInput')
    .attr('placeholder','https://redcapdatabase.com/api/')
    .attr('value','https://poa-redcap.med.yale.edu/api/')
    .attr('pattern','https://.*/api/');

  red.append('p').attr('class','configPrompt')
    .attr('id','tokenPrompt').text("Redcap API token:");

  conf.tokenInput = red.append('input').attr('id','apiToken')
    .attr('class','redcapInput')
    .attr('type', 'text');

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


  // Holds default time windows for negative, positive peaks
  // Starts empty
  conf.defaultTimes = [];

  // Hold info for our redcap connections
  conf.redcap = {
    url: "",
    token: ""
  };

  // Functions to save and load up our config
  conf.saveConfig = function()
  {

  };

  conf.loadConfig = function()
  {

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

    if(windows.length > 0)
      conf.plot.setDefaultTimes(windows);
  };
  conf.posTwInput0.on('input', conf.updateDefaultTimeWindows);
  conf.posTwInput1.on('input', conf.updateDefaultTimeWindows);
  conf.negTwInput0.on('input', conf.updateDefaultTimeWindows);
  conf.negTwInput1.on('input', conf.updateDefaultTimeWindows);

  // Update the recap connection details
  conf.updateRedcap = function()
  {
    console.log("trying to update redcap");
    // console.log(conf.urlInput);//.value,conf.urlInput.value.length);
    // console.log(conf.tokenInput);//.value,conf.tokenInput.value.length);

    conf.redcap = {
      url: conf.urlInput.property("value"),
      token: conf.tokenInput.property("value")
    };

    var urlValid = conf.urlInput.property('validity').valid;
    // console.log(urlValid);
    if(urlValid && conf.redcap.token.length == 32)
    {
      conf.plot.setRedcap(conf.redcap);
    }
  };
  conf.urlInput.on('change', conf.updateRedcap);
  conf.tokenInput.on('input', conf.updateRedcap);

  return conf;
};
