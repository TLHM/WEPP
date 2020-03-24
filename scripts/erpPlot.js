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

    // Create a svg div to hold everything
    plot.svg = parent.append('svg');

    plot.margin = margin;

    // w and h are for the full svg area
    // The usable plot area is this minus the margins
    plot.w = window.innerWidth - 10;
    plot.h = window.innerHeight - footerHeight - 10;

    // Set width and height for our svg
    plot.svg.attr('width',plot.w).attr('height',plot.h);

    // Holds all the actual plot stuff, margins are nice
    plot.body = plot.svg.append("g").attr('transform','translate('+plot.margin.left+','+plot.margin.top+')');

    // Create the axes transform functions
    plot.x = d3.scaleLinear().range([0,plot.w-plot.margin.left-plot.margin.right]);
    plot.y = d3.scaleLinear().range([plot.h-plot.margin.bottom-plot.margin.top,0]);

    // Default values for the actual values
    plot.xDomain = [-100,400];
    plot.defaultY = [-20, 30];
    plot.yDomain = [-20, 30];

    //Create visual axes
    plot.xAxis = plot.body.append('g')
        .attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');

    plot.yAxis = plot.body.append("g");

    // Create calls for setting these
    plot.xAxCall = d3.axisBottom(plot.x);
    plot.yAxCall = d3.axisLeft(plot.x);

    // Some grid lines, for helping with judging things
    // Grid is always the same size, even if the scale of the
    // Axes changes some (only gets larger, not smaller)
    plot.xGrid = plot.body.append('g')
        .attr('transform','translate(0,'+(plot.h-plot.margin.bottom-plot.margin.top)+')');
    plot.yGrid = plot.body.append('g');

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
    plot.lines = plot.body.append('g').attr('id','dataLines');


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

    // Holding our files we'll load and go through
    plot.fr = new FileReader();
    plot.files = [];
    plot.curfile = 0;
    plot.curERP = {};


    /**********************
    More function definitions
    *********************** */

    // Called when we get a new batch of files to load
    // Saves the list for further use, loads first file
    plot.loadList = function(flist) {
        console.log(flist);
        plot.files = flist;
        plot.curfile = 0;
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

        // Update our axes first
        plot.xDomain[0] = plot.curERP.times[0];
        plot.xDomain[1] = plot.curERP.times[plot.curERP.times.length-1];
        plot.updateAx();

        // Plot our butterfly lines
        plot.lines.selectAll("path")
            .data(plot.curERP.bins[plot.bin].data)
            .join("path")
                .attr("d",plot.lineData())
                .attr('class','butterflyLine');
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


    /**
       Parses a row of the text ERP file, which is transposed so each time/electrode is a row
       */
    plot.loadFiles = function(d)
    {
        return {
            Name: d[0],
            vals: d.slice(1).map(function(value){ return +value; }).slice(0,d.length-2)
        };
    };

    /**
       Passes on read text to a parser, then displays the data
       */
    plot.parse = function(t)
    {
        plot.data = d3.tsvParseRows(t).map(plot.row);

        // Fix x axis up
        plot.x.domain(d3.extent(plot.data[0].vals));
        plot.xAxis.call(d3.axisBottom(plot.x));

        plot.displayChan();
    };

    /**
       Turns data into a SVG line/path
       */
    //plot.lineFunc = ;

    /**
       Loads an ERP from a file name, then plots the data
       */
    plot.loadERP = function(fileName, ch)
    {
        plot.ch = ch;

        fnParts = fileName.slice(fileName.lastIndexOf('/')+1).split('_');
        plot.id = fnParts[0];
        plot.bin = fnParts[4].slice(0,fnParts[4].indexOf('.'));


        d3.text(fileName, plot.parse);
    };

    /**
       Actually displays an ERP after it is loaded, given the channel you want
       */
    plot.displayChan = function(ch='')
    {
        if(ch=='') ch = plot.ch;

        plot.curVals = plot.data[+ch].vals;

        // Fix y axis
        plot.y.domain(d3.extent(plot.curVals));
        plot.yAxis.call(d3.axisLeft(plot.y));

        plot.line.datum(plot.curVals).attr('d',d3.line()
                .x(function(d,i) {return plot.x(time[i])})
                .y(function(d) {return plot.y(d)})
                                          );
    };

    return plot;
};

console.log('hello');
