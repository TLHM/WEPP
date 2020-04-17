/*jshint esversion: 6 */

/**
  Responsible for sending data to redcap, holding it's configuration
  Creates configuration input boxes in a passed in div.
*/

export default function redcapComs(selection) {
    var rcComs = {
        selection: selection,
        token: "",
        url: "",
        pending: false,
        queued: false,
        validConnection: false,
        attemptCount: 0
    };

    // Create our redcap connection input boxes
    var red = rcComs.selection.append('div').attr('id', 'redcap');
    red.append('p').attr('class','configPrompt')
        .attr('id','apiPrompt').text("Redcap API URL:");

    rcComs.urlInput = red.append('input').attr('type', 'url')
        .attr('id','apiInput')
        .attr('class','redcapInput')
        .attr('placeholder','https://redcapdatabase.com/api/')
        .attr('value','https://poa-redcap.med.yale.edu/api/')
        .attr('pattern','https://.*/api/');

    red.append('p').attr('class','configPrompt')
        .attr('id','tokenPrompt').text("Redcap API token:");

    rcComs.tokenInput = red.append('input').attr('id','apiToken')
        .attr('class','redcapInput')
        .attr('type', 'text');


    // Update the recap connection details
    rcComs.updateRedcapSettings = function()
    {
        var urlValid = rcComs.urlInput.property('validity').valid;

        // Some basic validation
        if(urlValid && rcComs.tokenInput.property("value").length == 32)
        {
            // Only continue if it's actually different
            if(rcComs.url === rcComs.urlInput.property("value") &&
                rcComs.token === rcComs.tokenInput.property("value")) return;

            rcComs.url = rcComs.urlInput.property("value");
            rcComs.token = rcComs.tokenInput.property("value");
            rcComs.attemptCount = 0;
            rcComs.validConnection = false;

            rcComs.onChangeSettings();
        }
    };
    rcComs.urlInput.on('change', rcComs.updateRedcapSettings);
    rcComs.tokenInput.on('input', rcComs.updateRedcapSettings);


    // Function sends our peaks to a redcap database, if we have the config
    window.post = function(url, data) {
        //console.log(url, ...data);
        return fetch(url, {method: "POST", body: data});
    };

    // peaks should be a JSON string
    rcComs.sendPeaksToRedcap = function(peaks)
    {
        if(rcComs.token==="" || rcComs.url==="") return;

        if(rcComs.pending) {
            rcComs.queueUpload();
            return;
        }

        // We've failed 10 times in a row...gonna call it quits
        if(rcComs.attemptCount > 10) return;
        rcComs.attemptCount += 1;

        var request = new FormData();
        request.append('token', rcComs.token);
        request.append('content', "record");
        request.append('format', "json");
        request.append('type', "flat");
        request.append('overwriteBehavior', "normal");
        request.append('forceAutoNumber', true);
        request.append('data', peaks);
        request.append('returnContent', "count");
        request.append('returnFormat', "json");

        rcComs.pending = true;

        post(rcComs.url, request)
            .then(function(res)
            {
                console.log("Response:",res);
                return res.json();
            })
            .then(function(data)
            {
                if(data.count) rcComs.validConnection = true;

                rcComs.onPost(data);
                rcComs.pending = false;

                if(rcComs.queued) {
                    rcComs.queued = false;
                    rcComs.onQueueReady();
                }
            });
    };

    // We're pending, so queue up another upload when we finish
    rcComs.queueUpload = function() {
        rcComs.queued = true;
    };

    // Callback for when we're prepped for another upload
    rcComs.onQueueReady = function() {
        console.log("ready for another upload");
    };

    // Callback function that's triggered when we get a response from redcap
    rcComs.onPost = function(response) {
        if(response.count && response.count > 0)
        {
            //plot.uploadedPeaks += response.count;
        }
        else
        {
            console.log(response);
        }
    };

    // Callback for when our values have changed
    rcComs.onChangeSettings = function() {
        console.log('Redcap Settings Updated');
    };

    return rcComs;
}
