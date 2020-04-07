// ERP Plot

/**
   Creates an SVG plot that displays an ERP, and allows for the selection of peaks

   Requires a svg element.

   Requires d3 as a dependancy

   @param parent : The div to create this plot in
*/

var erpPlot = function(parent, margin, footerHeight)
{
    // This is the object we'll return
    var plot = {};

    // Header will hold info like the file name, bin of the current plot
    plot.header = parent.append('div').attr('id','plotHeader');
    plot.header.append('div').attr('id','fileBin');
    plot.header.select('#fileBin').append('div').attr('id','fileNameDisplay').text("No File Loaded");
    plot.header.select('#fileBin').append('div').attr('id','binDisplay').text("Bin: None");

    plot.header.append('svg').attr('id','chanLabels');

    // Create a svg div to hold all the plottin' and visuals
    plot.svg = parent.append('svg').attr('id','plotSVG');

    plot.margin = margin;

    // w and h are for the full svg area
    // The usable plot area is this minus the margins
    plot.w = window.innerWidth - 10;
    plot.h = window.innerHeight - footerHeight - 10;

    // Set width and height for our svg
    plot.svg.attr('width',plot.w).attr('height',plot.h);

    // Holds all the actual plot stuff, margins are nice
    plot.body = plot.svg.append("g")
        .attr('transform','translate('+plot.margin.left+','+plot.margin.top+')')
        .attr('id','plotBody');

    // Create the axes transform functions
    plot.x = d3.scaleLinear().range([0,plot.w-plot.margin.left-plot.margin.right]);
    plot.y = d3.scaleLinear().range([plot.h-plot.margin.bottom-plot.margin.top,0]).clamp(true);

    // Default values for the actual values
    plot.xDomain = [-100,400];
    plot.defaultY = [-20, 30];
    plot.yDomain = [-20, 30];

    // Group to hold plot background elements
    plot.background = plot.body.append('g').attr('id', 'background');
    plot.bgRectPos = plot.background.append('rect')
        .attr('y',0)
        .attr('height', plot.h-plot.margin.bottom-plot.margin.top)
        .attr('x',0)
        .attr('width',0)
        .attr('class','selectPos');
    plot.bgRectNeg = plot.background.append('rect')
        .attr('y',0)
        .attr('height', plot.h-plot.margin.bottom-plot.margin.top)
        .attr('x',0)
        .attr('width',0)
        .attr('class','selectNeg');

    //Create visual axes
    plot.xAxis = plot.body.append('g')
        .attr('id', 'xAxis')
        .attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');

    plot.yAxis = plot.body.append("g")
        .attr('id', 'yAxis');

    // Create calls for setting these
    plot.xAxCall = d3.axisBottom(plot.x);
    plot.yAxCall = d3.axisLeft(plot.x);

    // Some grid lines, for helping with judging things
    // Grid is always the same size, even if the scale of the
    // Axes changes some (only gets larger, not smaller)
    plot.xGrid = plot.body.append('g')
        .attr('id', 'xGrid')
        .attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');
    plot.yGrid = plot.body.append('g')
        .attr('id', 'yGrid');

    // Create calls for manipulating the grid
    plot.xgCall = d3.axisBottom(plot.x)
        .tickFormat("")
        .tickSize(-(plot.h-plot.margin.bottom-plot.margin.top));
    plot.ygCall = d3.axisLeft(plot.y)
        .tickFormat("")
        .tickSize(-(plot.w-plot.margin.left-plot.margin.right));

    // Create thicker lines for 0's
    plot.x0 = plot.xGrid.append('line')
        .attr('stroke','currentColor')
        .attr('stroke-width',1.5);
    plot.y0 = plot.yGrid.append('line')
        .attr('stroke','currentColor')
        .attr('stroke-width',1.5);

    // This group holds all our lines for real data
    plot.bgLines = plot.body.append('g').attr('id','bgLines');
    plot.outlines = plot.body.append('g').attr('id','chanOutlines');
    plot.lines = plot.body.append('g').attr('id','chanLines');

    // This group will hold picked peak markers
    plot.peakViz = plot.body.append('g').attr('id','peakViz');
    plot.posPeaks = plot.peakViz.append('g').attr('id', 'posPeaks');
    plot.negPeaks = plot.peakViz.append('g').attr('id', 'negPeaks');
    // Will hold the peaks for a single bin
    // Each point in array will be an obj with:
    //  amp, lat, chan, bin, file
    plot.peaks = {pos:[],neg:[]};
    // Saves with extra info: file and polarity as part of the obj
    // Added to by savePeaks function
    plot.savedPeaks = [];

    // Function to update the axes and grid based on current
    // values of xDomain and  yDomain
    plot.updateAx = function() {
        // Update our scaling functions based on our domains
        plot.x.domain(plot.xDomain);
        plot.y.domain(plot.yDomain);

        // Want ticks based on intervals of 100ms, 10µV
        console.log(plot.getTicks(plot.xDomain[0],plot.xDomain[1],100))
        plot.xAxCall.scale(plot.x).tickValues(plot.getTicks(plot.xDomain[0],plot.xDomain[1],100));
        plot.yAxCall.scale(plot.y).tickValues(plot.getTicks(plot.yDomain[0],plot.yDomain[1],10));

        // Update our axes
        plot.xAxis.call(plot.xAxCall);
        plot.yAxis.call(plot.yAxCall);

        // Update our grid line ticks and scale
        plot.xgCall.scale(plot.x)
            .tickValues(plot.getTicks(plot.xDomain[0],plot.xDomain[1],50));
        plot.ygCall.scale(plot.y)
            .tickValues(plot.getTicks(plot.yDomain[0],plot.yDomain[1],2));

        plot.xGrid.call(plot.xgCall)
            .call(g => g.selectAll(".tick line")
                .attr("stroke-opacity", 0.1));
        plot.yGrid.call(plot.ygCall)
            .call(g => g.selectAll(".tick line")
                .attr("stroke-opacity", 0.1));

        // Update our 0x, 0y lines
        plot.x0.attr("x1",plot.x(0))
            .attr("x2",plot.x(0))
            .attr("y1",-plot.y(plot.yDomain[0]))
            .attr("y2",plot.y(plot.yDomain[1]));
        plot.y0.attr("x1",plot.x(plot.xDomain[0]))
            .attr("x2",plot.x(plot.xDomain[1]))
            .attr("y1",plot.y(0))
            .attr("y2",plot.y(0));
    };

    // Helper function for our axes
    plot.getTicks = function(start,stop,step) {
        start = Math.floor(start/step)*step;
        return Array(Math.ceil((stop - start) / step)+1).fill(start).map((x, i) => x + i * step);
    };

    // Set default plot axes, grid
    plot.updateAx();

    // For future use
    plot.id = 'NONE';
    plot.bin = 0;
    plot.ch = 'NONE';

    // Config variables
    plot.defaultTimeWindows = [];
    plot.redcap = {};
    // Tracks how many peaks we've already uploaded to RedCap
    plot.uploadedPeaks = 0;

    // Holding our files we'll load and go through
    plot.fr = new FileReader();
    plot.files = [];
    plot.curFile = 0;
    plot.curERP = {};


    /**********************
    More function definitions
    *********************** */

    // Called when we get a new batch of files to load
    // Saves the list for further use, loads first file
    plot.loadList = function(flist) {
        console.log(flist);
        plot.files = flist;
        plot.curFile = 0;
        plot.bin = 0;
        plot.navDir = 1;

        if(flist.length>0) {
            plot.loadFile(0);
        }
    };

    // Actually loads a file from our file list
    // Uses a FileReader object
    // On completion, it will display the file thanks to
    // The filereader's event responses
    plot.loadFile = function(i) {
        if(i < 0 || i >= plot.files.length) return;

        plot.fr.readAsText(plot.files[i]);
        plot.curFileName = plot.files[i].name;
    };

    // Function that runs once a file is loaded
    plot.fr.onload = function(event) {
        // Get our data into a json object
        plot.curERP = JSON.parse(event.target.result);

        // Set current bin
        plot.bin = 0;
        if(plot.navDir < 0) {
            plot.bin = plot.curERP.bins.length-1;
        }

        plot.showCurERP();
    };

    // Helper function to get path data for a channel
    plot.lineData = function() {
        return d3.line()
            .x((d,i)=>plot.x(plot.curERP.times[i]))
            .y((d,i)=>plot.y(d));
    };

    // Function that actually displays an ERP
    // It should be a nice object now, with bins etc
    plot.showCurERP = function() {
        console.log(plot.curERP);

        // Update display of filename and bin
        plot.header.select('#fileNameDisplay').text(plot.curFileName);
        plot.header.select('#binDisplay').text(plot.curERP.bins[plot.bin].name);

        // Update our axes first
        plot.xDomain[0] = plot.curERP.times[0];
        plot.xDomain[1] = plot.curERP.times[plot.curERP.times.length-1];
        plot.updateAx();

        // Estimate the "important" channels, ie ones not named E##
        // If there are none, pick the middle channel arbitrarily
        var chanRegex = /E\d+/;
        plot.pickChans = plot.curERP.chans.map(x => !chanRegex.test(x));
        console.log(plot.pickChans);

        // Get our important channel names
        plot.pickedChanNames = plot.curERP.chans.filter((d, ind) => plot.pickChans[ind]);

        // Display our channels in our channel labels svg
        // If there are more than 5, then we don't have enough different
        // Line types, so we'll just give up and show nothing
        var showChans = plot.pickedChanNames;
        if(plot.pickedChanNames.length > 5)
        {
            showChans = [];
        }
        console.log(showChans);
        var labels = plot.header.select('#chanLabels').selectAll('g')
            .data(showChans)
            .join('g')
                .attr('id','chanLabel');
        labels.append('line')
                .attr('x1', function(d,i){ return 10 + 120*i; })
                .attr('x2', function(d,i){ return 40 + 120*i; })
                .attr('y1', function(d,i){ return 65; })
                .attr('y2', function(d,i){ return 65; })
                .attr('class', function(d, i){ return 'chanLine lineType'+(i%5); });
        labels.append('text')
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "left")
                .attr("y", 68)
                .attr("x", function(d,i){ return 45 + 120*i; })
                .text(function(d){ return d.substring(0,Math.min(d.length,15)); });


        // Plot our butterfly lines
        console.log(plot.curERP.bins[plot.bin].data.filter((d, ind) => plot.pickChans[ind]));
        plot.bgLines.selectAll("path")
            .data(plot.curERP.bins[plot.bin].data.filter((d, ind) => !plot.pickChans[ind]))
            .join("path")
                .attr("d",plot.lineData())
                .attr('class','butterflyLine');

        // Plot our special lines
        // Double, since we want an outline to make them more visible
        plot.outlines.selectAll("path")
            .data(plot.curERP.bins[plot.bin].data.filter((d, ind) => plot.pickChans[ind]))
            .join("path")
                .attr("d",plot.lineData())
                .attr('class','chanLineBG');
        plot.lines.selectAll("path")
            .data(plot.curERP.bins[plot.bin].data.filter((d, ind) => plot.pickChans[ind]))
            .join("path")
                .attr("d", plot.lineData())
                .attr('class', function(d, i){ return 'chanLine lineType'+(i%5); });

        // Clear the old peaks, get new ones if we have defaults
        plot.clearPeaks();
        plot.highlightDefault();
    };

    // For navigating bins, files
    plot.prevBin = function() {
        console.log("prev Bin");
        if(plot.bin==0) {
            plot.prevFile();
        } else {
            plot.bin -= 1;

            plot.showCurERP();
        }
    };

    plot.prevFile = function() {
        if(plot.curFile > 0) {
            plot.curFile -= 1;
            plot.navDir = -1;
            plot.loadFile(plot.curFile);
        }
    };

    plot.nextBin = function() {
        if(!plot.curERP.bins) return;

        console.log("next Bin");
        if(plot.bin==plot.curERP.bins.length-1) {
            plot.nextFile();
        } else {
            plot.bin += 1;

            plot.showCurERP();
        }
    };

    plot.nextFile = function() {
        if(plot.curFile < plot.files.length-1) {
            plot.curFile += 1;
            plot.navDir = 1;
            plot.loadFile(plot.curFile);
        }
    };

    // Function to accept our current peaks and continue to the next bin
    plot.acceptAndNext = function()
    {
        // Accept / save our peaks
        plot.savePeaks();

        // move on
        plot.nextBin();
    };

    // Function sends our peaks to a redcap database, if we have the config
    window.post = function(url, data) {
        console.log(url, ...data);
        return fetch(url, {method: "POST", body: data});
    };
    plot.sendPeaksToRedcap = function()
    {
        if(!plot.redcap.token || !plot.redcap.url) return;

        var request = new FormData();
        request.append('token', plot.redcap.token);
        request.append('content', "record");
        request.append('format', "json");
        request.append('type', "flat");
        request.append('overwriteBehavior', "normal");
        request.append('forceAutoNumber', true);
        request.append('data', plot.getPeaksAsJSON());
        request.append('returnContent', "count");
        request.append('returnFormat', "json");

        post(plot.redcap.url, request)
            .then(function(res)
            {
                console.log("Response:",res);
                return res.json();
            })
            .then(function(data)
            {
                if(data.count && data.count > 0)
                {
                    plot.uploadedPeaks += data.count;
                }
                else
                {
                    console.log(data);
                }
            });
    };

    /**
        Drag handlers for highlighting time ranges
    */
    // clickType is 1 for left mouse (positive),
    // 2 for right mouse (negative)
    plot.clickType = -1;
    plot.dragPos = [0, 0]; // Start, and dx
    plot.dragStart = function()
    {
        //console.log(d3.event.sourceEvent.button);

        plot.clickType = d3.event.sourceEvent.button;
        plot.dragPos[0] = d3.mouse(this)[0] - plot.margin.left;
        plot.dragPos[1] = plot.dragPos[0];
    };
    plot.dragUpdate= function()
    {
        // Update our mouse pos
        plot.dragPos[1] = d3.mouse(this)[0] - plot.margin.left;

        // Update highlight rect
        plot.highlight();
    };
    plot.dragEnd = function()
    {
        // If we barely dragged, use a default width centered on av of x's
        if(Math.abs(plot.dragPos[0]-plot.dragPos[1]) < 5)
        {
            var width = plot.x(20)-plot.x(0); // in pixels, select 40 ms
            var middle = (plot.dragPos[0] + plot.dragPos[1])/2;
            plot.dragPos[0] = middle - width;
            plot.dragPos[1] = middle + width;
            //console.log(width, middle);

            // Update highlight rect
            plot.highlight();
        }
        //console.log(d3.event);

        // Reset the mouse button thing
        plot.clickType = -1;
    };
    plot.dragHandler = d3.drag()
            .on("start", plot.dragStart)
            .on("drag", plot.dragUpdate)
            .on("end", plot.dragEnd)
            // This filter usually blocks right click, but we want both
            .filter(function(){return true;});

    /**
        Click Handler
    */
    // plot.clickHandler = function(e)
    // {
    //     console.log(d3.event);
    // };

    /**
        Function for highlighting parts of the background
    */
    plot.highlight = function()
    {
        if(!plot.curFileName) return;

        var ind, peak;
        // Normal left click = Positive
        if(plot.clickType==0)
        {
            plot.bgRectPos
                .attr('x', Math.min(plot.dragPos[0],plot.dragPos[1]))
                .attr('width', Math.abs(plot.dragPos[0]-plot.dragPos[1]));

            // Search for a peak in the time range for each channel
            plot.peaks.pos = [];
            for(ind=0; ind<plot.curERP.chans.length; ind++)
            {
                if(!plot.pickChans[ind]) continue;

                peak = plot.calcPeak(0,
                    [plot.x.invert(Math.min(plot.dragPos[0],plot.dragPos[1])),
                    plot.x.invert(Math.max(plot.dragPos[0],plot.dragPos[1]))],
                    ind
                );

                plot.peaks.pos.push({
                    lat: peak[0],
                    amp: peak[1],
                    file: plot.curFileName,
                    bin: plot.curERP.bins[plot.bin].name,
                    chan: plot.curERP.chans[ind]
                });
            }

            // Update display
            plot.showPeaks();

        }
        // Right click = Negative
        else if(plot.clickType == 2)
        {
            plot.bgRectNeg
                .attr('x', Math.min(plot.dragPos[0],plot.dragPos[1]))
                .attr('width', Math.abs(plot.dragPos[0]-plot.dragPos[1]));

            // Search for a peak in the time range for each channel
            plot.peaks.neg = [];
            for(ind=0; ind<plot.curERP.chans.length; ind++)
            {
                if(!plot.pickChans[ind]) continue;

                peak = plot.calcPeak(1,
                    [plot.x.invert(Math.min(plot.dragPos[0],plot.dragPos[1])),
                    plot.x.invert(Math.max(plot.dragPos[0],plot.dragPos[1]))],
                    ind
                );

                plot.peaks.neg.push({
                    lat: peak[0],
                    amp: peak[1],
                    file: plot.curFileName,
                    bin: plot.curERP.bins[plot.bin].name,
                    chan: plot.curERP.chans[ind]
                });
            }

            // Update display
            plot.showPeaks();
        }
    };

    // Highlights defaults time windows, if any
    // Called when going to a new file / bin
    plot.highlightDefault = function()
    {
        // Loop through and highlight each default window
        for(var i=0; i<plot.defaultTimeWindows.length; i++)
        {
            plot.dragPos = plot.defaultTimeWindows[i].range.map(t => plot.x(t));
            plot.clickType = plot.defaultTimeWindows[i].type == 'pos' ? 0 : 2;

            plot.highlight();
        }
    };

    // Clears all the peaks ; moving to another plot without saving
    plot.clearPeaks = function()
    {
        plot.peaks.pos = [];
        plot.peaks.neg = [];
        plot.showPeaks();

        plot.bgRectPos.attr('width','0');
        plot.bgRectNeg.attr('width','0');
    };

    // Saves our current peaks
    // Tries to upload them to Redcap as well, if possible
    plot.savePeaks = function()
    {
        var i=0;
        var p;
        for(i=0; i<plot.peaks.pos.length; i++)
        {
            p = plot.peaks.pos[i];
            plot.savedPeaks.push({
                record_id: plot.savedPeaks.length,
                filename: p.file,
                peakpolarity: 1,
                latency: p.lat,
                amplitude: p.amp,
                bin: p.bin,
                chan: p.chan
            });
        }
        for(i=0; i<plot.peaks.neg.length; i++)
        {
            p = plot.peaks.neg[i];
            plot.savedPeaks.push({
                record_id: plot.savedPeaks.length,
                filename: p.file,
                peakpolarity: 2,
                latency: p.lat,
                amplitude: p.amp,
                bin: p.bin,
                chan: p.chan
            });
        }

        plot.sendPeaksToRedcap();
    };

    // Gets our peaks as a JSON string for upload to redcap
    plot.getPeaksAsJSON = function()
    {
        return JSON.stringify(plot.savedPeaks.slice(plot.uploadedPeaks), separators=(",",":"));
    };

    /**
        Calculates the positive of negative peak in a time range
        Applies to a single channel
        Returns (lat, amp) of found peak
        peakType should be 0 for positive, 1 for negative
        timeRange should be in ms
    */
    plot.calcPeak = function(peakType, timeRange, channel)
    {
        var chanData = plot.curERP.bins[plot.bin].data[channel];

        // How many points before and after we check to make sure we're a "peak"
        var neighbors = 3;

        // Translate our time in ms to indicies in our data arrays
        var indicies = [plot.curERP.times.indexOf(Math.round(timeRange[0])),
            plot.curERP.times.indexOf(Math.round(timeRange[1]))];
        if(indicies[0]<neighbors) indicies[0] = neighbors;
        if(indicies[1]>plot.curERP.times.length-neighbors) indicies[1] = plot.curERP.times.length-neighbors;

        // console.log(timeRange, indicies, plot.curERP.times[indicies[0]], plot.curERP.times[indicies[1]]);

        //var peakAmps = [];
        var peakLats = [];
        var curExtreme = peakType==0 ? -999 : 999;

        // Loop through points, see if it's a better peak
        // We want the maximal (positive) or minimal (negative)
        for(var i=indicies[0]; i < indicies[1]; i++)
        {
            var v = chanData[i];

            // Get the mean of its left and right neighbors
            var meanL = 0;
            for(var ii=i-neighbors; ii<i; ii++)
            {
                meanL += chanData[ii];
            }
            meanL /= neighbors;

            var meanR = 0;
            for(ii=i+1; ii<i+neighbors+1; ii++)
            {
                meanR += chanData[ii];
            }
            meanR /= neighbors;

            // check to see if this point is more extreme than
            // Its immediate neighbors, and the average of its neighbors
            if(peakType == 0)
            {
                if(v > meanL && v > meanR &&
                    v > chanData[i-1] && v > chanData[i+1])
                {
                    // We found a new positive peak
                    // If it's >= current extreme, then we save it
                    if(v > curExtreme)
                    {
                        curExtreme = v;
                        peakLats = [plot.curERP.times[i]];
                    }
                    else if(v == curExtreme)
                    {
                        peakLats.push(plot.curERP.times[i]);
                    }
                }
            }
            else if(v < meanL && v < meanR &&
                v < chanData[i-1] && v < chanData[i+1])
            {
                // We found a new negative peak
                // If it's <= current extreme, then we save it
                if(v < curExtreme)
                {
                    curExtreme = v;
                    peakLats = [plot.curERP.times[i]];
                }
                else if(v == curExtreme)
                {
                    peakLats.push(plot.curERP.times[i]);
                }
            }
        }

        // If we have multiple latencies, we'll use the median
        // Note that this is only used if we found multiple peaks with the same amp
        if(peakLats.length > 1)
        {
            var mid = Math.roung(peakLats/2);
            peakLats = [peakLats[mid]];
        }
        else if(peakLats.length < 1)
        {
            return [-999, curExtreme];
        }

        return [peakLats[0], curExtreme];
    };

    // Displays our peaks
    plot.showPeaks = function()
    {
        //console.log(plot.peaks);

        // Display positive peaks
        plot.posPeaks.selectAll("circle")
            .data(plot.peaks.pos)
            .join("circle")
                .attr("cx", function(d){ return plot.x(d.lat); })
                .attr("cy", function(d){ return plot.y(d.amp); })
                .attr("r", 5)
                .attr('class','posPeak');

        // Display negative peaks
        plot.negPeaks.selectAll("circle")
            .data(plot.peaks.neg)
            .join("circle")
                .attr("cx", function(d){ return plot.x(d.lat); })
                .attr("cy", function(d){ return plot.y(d.amp); })
                .attr("r", 5)
                .attr('class','negPeak');
    };


    // Configuration functions

    plot.setRedcap = function(newRed)
    {
        plot.redcap = newRed;
    };

    plot.setDefaultTimes = function(newDefaults)
    {
        plot.defaultTimeWindows = newDefaults;
    };


    // Set up click and drag handlers
    plot.svg
        .call(plot.dragHandler)
        //.on("click", plot.clickHandler)
        .on("contextmenu",function(){
            d3.event.preventDefault();
        });

    return plot;
};

console.log('hello');
