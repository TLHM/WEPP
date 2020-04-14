/*jshint esversion: 6 */

/**
  Responsible for loading and holding all the ERP data, as well as
  switching between files, uploading to Redcap given the credentials, etc.
*/

export default function erpDataContainer() {
    var data = {
        reader : new FileReader(),
        fileList : [],
        curFileIndex : 0,
        curBinIndex: 0,
        curERP : {},
    };

    // Called when we get a new batch of files to load
    // Saves the list for further use, loads first file (if there is one)
    data.loadList = function(flist) {
        data.fileList = [];

        // loop through, only keep the .json files
        for(var i=0; i<flist.length; i++) {
            if(flist[i].name.endsWith('.json')) data.fileList.push(flist[i]);
        }
        console.log(data.fileList);

        // Default file and bin index
        data.curFileIndex = 0;
        data.curBinIndex = 0;

        // Load first file, if there is one
        data.loadCurrentFile();
    };

    // Actually loads a file from our file list
    // Uses a FileReader object
    // On completion, it will display the file thanks to
    // the filereader's event responses
    data.loadCurrentFile = function() {
        const i = data.curFileIndex;

        // Make sure we're in range
        if(i < 0 || i >= data.fileList.length) return;

        // Ask our file read to read it in
        data.reader.readAsText(data.fileList[i]);
        data.curFileName = data.fileList[i].name;
    };

    // Function that runs once a file is loaded
    data.reader.onload = function(event) {
        // Get our data into a json object
        data.curERP = JSON.parse(event.target.result);
        data.curERP.fileName = data.curFileName;

        // Set current bin if necessary
        if(data.curBinIndex < 0) {
            data.curBinIndex = data.curERP.bins.length-1;
        }

        data.onNewERPFile(data.curERP);
        data.onNewBin(data.curERP.bins[data.curBinIndex])
    };

    // Callback that gets called when new ERP file is loaded
    // Note this is ONLY when a full new file is loaded
    // There is a separate callback when a bin changes / is loaded
    data.onNewERPFile = function(erp) {
        console.log('Loaded a new ERP file!');
        console.log(erp);
    };

    // Callback that gets called when the current bin is changed
    // Gets passed the data of the current bin
    // Also gets called when a new ERP file is loaded
    data.onNewBin = function(bin) {
        console.log('Changed the current bin!');
        console.log(bin);
    };


    // For navigating bins, files
    data.prevBin = function() {
        console.log("prev Bin");
        if(data.curBinIndex === 0) {
            data.prevFile();
        } else {
            data.curBinIndex -= 1;

            data.onNewBin(data.curERP.bins[data.curBinIndex]);
        }
    };

    data.prevFile = function() {
        if(data.curFileIndex > 0) {
            data.curFileIndex -= 1;
            data.curBinIndex = -1; // Set to -1, so we load up last bin first
            data.loadCurrentFile();
        }
    };

    data.nextBin = function() {
        if(!data.curERP.bins) return;

        console.log("next Bin");
        if(data.curBinIndex === data.curERP.bins.length-1) {
            data.nextFile();
        } else {
            data.curBinIndex += 1;

            data.onNewBin(data.curERP.bins[data.curBinIndex]);
        }
    };

    data.nextFile = function() {
        if(data.curFileIndex < data.fileList.length-1) {
            data.curFileIndex += 1;
            data.curBinIndex = 0;
            data.loadCurrentFile();
        }
    };



    return data;
}
