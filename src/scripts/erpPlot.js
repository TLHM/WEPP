/*jshint esversion: 6 */
// ERP Plot

/**
   Creates an SVG plot that displays an ERP, and allows for the selection of peaks

   Requires a svg element.

   Requires d3 as a dependancy

   @param parent : The div to create this plot in
*/

import * as d3 from 'd3';

export default function erpPlot(parent, margin)
{
    // This is the object we'll return
    var plot = {
        parent: parent
    };

    // Header will show channels and their line types
    //plot.header = parent.append('div').attr('id','plotHeader');
    //plot.header.append('svg').attr('id','chanLabels');

    // Create a svg div to hold all the plottin' and visuals
    plot.svg = parent.append('svg').attr('id','plotSVG');

    plot.margin = margin;
    plot.parentSize = plot.parent.node().getBoundingClientRect();
    console.log(plot.parentSize);

    // w and h are for the full svg area
    // The usable plot area is this minus the margins
    plot.w = plot.parentSize.width - 10;
    plot.h = window.innerHeight*0.8 - 10;

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
        //console.log(plot.getTicks(plot.xDomain[0],plot.xDomain[1],100));
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

    // Function to set our size properly given a parent div
    plot.resize = function() {
        //console.log('resizin');
        plot.parentSize = plot.parent.node().getBoundingClientRect();

        // update basic area, grid, axis, etc.
        //plot.w = plot.parentSize.width - 10; // Issue with left panel, causing shrink
        plot.w = window.innerWidth - 320;
        plot.h = window.innerHeight*0.8 - 10;

        plot.svg.attr('width',plot.w).attr('height',plot.h);

        // grab old values of the for the hightlights before we update scale
        var highlights = [
            plot.x.invert(plot.bgRectPos.attr('x')),
            plot.x.invert((+plot.bgRectPos.attr('x')) + (+plot.bgRectPos.attr('width'))),
            plot.x.invert(plot.bgRectNeg.attr('x')),
            plot.x.invert((+plot.bgRectNeg.attr('x')) + (+plot.bgRectNeg.attr('width'))),
        ];

        plot.x.range([0,plot.w-plot.margin.left-plot.margin.right]);
        plot.y.range([plot.h-plot.margin.bottom-plot.margin.top,0]);

        plot.xAxis.attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');
        plot.xGrid.attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');

        plot.xgCall.tickSize(-(plot.h-plot.margin.bottom-plot.margin.top));
        plot.ygCall.tickSize(-(plot.w-plot.margin.left-plot.margin.right));

        plot.updateAx();

        // Update highlight boxes
        plot.bgRectPos.attr('height', plot.h-plot.margin.bottom-plot.margin.top);
        plot.bgRectNeg.attr('height', plot.h-plot.margin.bottom-plot.margin.top);
        plot.bgRectPos
            .attr('x', plot.x(highlights[0]))
            .attr('width', plot.x(highlights[1]) - plot.x(highlights[0]));
        plot.bgRectNeg
            .attr('x', plot.x(highlights[2]))
            .attr('width', plot.x(highlights[3]) - plot.x(highlights[2]));

        // Peaks and ERP data are redrawn elsewhere
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


    /**********************
    More function definitions
    *********************** */

    // Helper function to get path data for a channel
    plot.lineData = function() {
        return d3.line()
            .x((d,i)=>plot.x(plot.curTimes[i]))
            .y((d,i)=>plot.y(d));
    };

    // Function called for a new ERP file
    // Updates time, axes, as well as some display
    // Doesn't plot the data
    plot.updateERP = function(erp)
    {
        plot.curFileName = erp.fileName;
        //plot.header.select('#fileNameDisplay').text(erp.fileName);

        plot.curTimes = erp.times;

        // Update our axes
        plot.xDomain[0] = plot.curTimes[0];
        plot.xDomain[1] = plot.curTimes[plot.curTimes.length-1];
        plot.updateAx();

        // Display our channels in our channel labels svg
        // If there are more than 5, then we don't have enough different
        // Line types, so we'll just give up and show nothing
        var showChans = erp.selectedChanNames;
        // if(plot.pickedChanNames.length > 5)
        // {
        //     showChans = [];
        // }
        //console.log(showChans);
        // var labels = plot.header.select('#chanLabels').selectAll('g')
        //     .data(showChans)
        //     .join('g')
        //         .attr('id','chanLabel');
        // labels.append('line')
        //         .attr('x1', function(d,i){ return 10 + 120*i; })
        //         .attr('x2', function(d,i){ return 40 + 120*i; })
        //         .attr('y1', function(d,i){ return 65; })
        //         .attr('y2', function(d,i){ return 65; })
        //         .attr('class', function(d, i){ return 'chanLine lineType'+(i%5); });
        // labels.append('text')
        //         .attr("font-family", "sans-serif")
        //         .attr("font-size", 10)
        //         .attr("text-anchor", "left")
        //         .attr("y", 68)
        //         .attr("x", function(d,i){ return 45 + 120*i; })
        //         .text(function(d){ return d.substring(0,Math.min(d.length,15)); });

    };

    // Function that actually plots channel data
    // Called each time that a new bin is loaded
    plot.showBinData = function(bin, selectedChannels) {
        //console.log(bin);

        // Update display of bin
        //plot.header.select('#binDisplay').text(bin.name);

        // Plot our butterfly lines
        //console.log(bin.data.filter((d, ind) => selectedChannels[ind]));
        plot.bgLines.selectAll("path")
            .data(bin.data.filter((d, ind) => !selectedChannels[ind]))
            .join("path")
                .attr("d", plot.lineData())
                .attr('class','butterflyLine');

        // Plot our special lines
        // Double, since we want an outline to make them more visible
        plot.outlines.selectAll("path")
            .data(bin.data.filter((d, ind) => selectedChannels[ind]))
            .join("path")
                .attr("d", plot.lineData())
                .attr('class','chanLineBG');
        plot.lines.selectAll("path")
            .data(bin.data.filter((d, ind) => selectedChannels[ind]))
            .join("path")
                .attr("d", plot.lineData())
                .attr('class', function(d, i){ return 'chanLine lineType'+(i%5); });

        // Clear the old peaks, get new ones if we have defaults
        // Moved to the onNewBin set in index.js
        //plot.clearPeaks();
        //plot.highlightDefault();
    };

    /**
        Drag handlers for highlighting time ranges
    */
    // d3.event.sourceEvent.button is 0 for left mouse (positive),
    // 2 for right mouse (negative)
    // We translate it into pos:1, neg:2 and keep that as clickType
    plot.clickType = -1;
    plot.dragPos = [0, 0]; // Start, and dx
    plot.dragStart = function()
    {
        //console.log(d3.event.sourceEvent.button);

        plot.clickType = d3.event.sourceEvent.button==0 ? 1 : 2;
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
    plot.onDragEnd = function() {
        console.log('drag has ended');
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

        // Callback
        plot.onDragEnd();
    };
    plot.dragHandler = d3.drag()
            .on("start", plot.dragStart)
            .on("drag", plot.dragUpdate)
            .on("end", plot.dragEnd)
            // This filter usually blocks right click, but we want both
            .filter(function(){return true;});

    /**
        Function for highlighting parts of the background
    */
    plot.highlight = function()
    {
        if(!plot.curFileName) return;

        var ind, peak;
        // Normal left click = Positive
        if(plot.clickType==1)
        {
            plot.bgRectPos
                .attr('x', Math.min(plot.dragPos[0],plot.dragPos[1]))
                .attr('width', Math.abs(plot.dragPos[0]-plot.dragPos[1]));
        }
        // Right click = Negative
        else if(plot.clickType == 2)
        {
            plot.bgRectNeg
                .attr('x', Math.min(plot.dragPos[0],plot.dragPos[1]))
                .attr('width', Math.abs(plot.dragPos[0]-plot.dragPos[1]));
        }

        plot.onHighlight(
            [
                plot.x.invert(Math.min(plot.dragPos[0],plot.dragPos[1])),
                plot.x.invert(Math.max(plot.dragPos[0],plot.dragPos[1]))
            ],
            plot.clickType);
    };

    // Callback that gets called when we highlight
    // Parameters are timeRange (ms) and polarity (0=pos, 1=neg)
    plot.onHighlight = function(timeRange, polarity) {
        console.log("Highlight!")
    };

    // Highlights defaults time windows, if any
    // Called when going to a new file / bin
    plot.highlightDefault = function()
    {
        // Reset the highlights
        plot.bgRectPos.attr('width','0');
        plot.bgRectNeg.attr('width','0');

        // Only highlight if we don't have peaks already displayed
        if(plot.posPeaks.selectAll('circle').size() > 0 ||
            plot.negPeaks.selectAll('circle').size() > 0) return;

        // Loop through and highlight each default window
        for(var i=0; i<plot.defaultTimeWindows.length; i++)
        {
            plot.dragPos = plot.defaultTimeWindows[i].range.map(t => plot.x(t));
            plot.clickType = plot.defaultTimeWindows[i].type == 'pos' ? 1 : 2;

            plot.highlight();
            plot.onDragEnd();
        }
    };

    // Displays peaks
    plot.showPeaks = function(pos, neg)
    {
        //console.log(plot.peaks);

        // Display positive peaks
        plot.posPeaks.selectAll("circle")
            .data(pos)
            .join("circle")
                .attr("cx", function(d){ return plot.x(d.latency); })
                .attr("cy", function(d){ return plot.y(d.amplitude); })
                .attr("r", 5)
                .attr('class','posPeak');

        // Display negative peaks
        plot.negPeaks.selectAll("circle")
            .data(neg)
            .join("circle")
                .attr("cx", function(d){ return plot.x(d.latency); })
                .attr("cy", function(d){ return plot.y(d.amplitude); })
                .attr("r", 5)
                .attr('class','negPeak');
    };

    // Highlight channels temporarily
    plot.curSel = {sel:false, index:0};
    plot.hoverChannel = function(selLoc) {
        if(selLoc.sel){
            plot.curSel = plot.lines.selectAll("path").nodes()[selLoc.index];
        }else{
            plot.curSel = plot.bgLines.selectAll("path").nodes()[selLoc.index];
        }
        d3.select(plot.curSel).style('stroke','orange')
            .style('stroke-width', 2)
            .style('opacity', 1);
    };
    plot.endHoverChannel = function() {
        d3.select(plot.curSel).style('stroke',null)
            .style('stroke-width', null)
            .style('opacity', null);
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
