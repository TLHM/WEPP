/*jshint esversion: 6 */

/**
  Responsible for loading and holding all the ERP data, as well as
  switching between files, holding project configuration, etc.
*/

import downloadBlob from './blobDL.js';

export default function erpDataContainer() {
    var data = {
        reader: new FileReader(),
        fileList: [],
        listProgress: 0,
        confFil: {},
        config: {
            selectedChannels: [],
            selectedChanNames: [],
            selectedBins: [],
            selectedBinCount: [],
        },
        curFileIndex : 0,
        curBinIndex: 0,
        curERP: {},
        tempPeaks: [],  // Holds peaks until highlight is finalized
        pickedPeaks: [], // Holds peaks for current bin that we've picked
        peakArchive: [], // Holds peaks for current session
        modified: [],
        uploadedCount: 0,
        lastUpload: -1,
        peakIndexCounter: 0,
    };

    // Called when we get a new batch of files to load
    // Saves the list for further use, loads first file (if there is one)
    data.loadList = function(flist) {
        console.log(flist);
        data.fileList = [];
        data.listProgress = 0;

        // loop through, only keep the .json files
        for(var i=0; i<flist.length; i++) {
            if(flist[i].name === 'wepp_conf.json') {
                data.confFile = flist[i];
                continue;
            }

            if(flist[i].name.endsWith('.json')) data.fileList.push(flist[i]);
        }
        // Sort it
        data.fileList.sort((a,b) => a.name.localeCompare(b.name));

        // Default file and bin index
        data.curFileIndex = 0;
        data.curBinIndex = 0;

        // Load config file if we have one
        if(data.confFile) {
            data.onFindConf(data.confFile);
        }

        // Load first file, if there is one
        data.loadCurrentFile();
    };

    // Selects a specific file
    data.selectFile = function(index) {
        if(index < 0 || index >= data.fileList.length) return;
        if(index === data.curFileIndex) return;

        data.curFileIndex = index;
        data.curBinIndex = 0;
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
        console.log(data.fileList[i]);
        // Ask our file read to read it in
        data.reader.readAsText(data.fileList[i]);
        data.curFileName = data.fileList[i].name;
    };

    // Function that runs once a file is loaded
    data.reader.onload = function(event) {
        // Get our data into a json object & load!

        data.loadJSON(JSON.parse(event.target.result));
    };

    data.onConfigUpdate = function(config) {
      console.log('Loaded Config File');
    };

    data.onFindConf = function() {
        console.log('found a config file');
    };

    data.recalculateSelectedChans = function(){
        if(!data.curERP.chans) return;

        data.config.selectedChannels = data.config.selectedChanNames.map(x => data.curERP.chans.indexOf(x));

        // If we don't find any of the channels, we'll need to redo this
        // Remove any -1 from our array
        for(var ir=data.config.selectedChannels.length-1; ir>=0; ir--){
            if(data.config.selectedChannels[ir]==-1) data.config.selectedChannels = data.config.selectedChannels.splice(ir,1);
        }

        data.curERP.selectedChannels = data.config.selectedChannels;
    };

    data.loadJSON = function(jsonData) {
        data.curERP = jsonData;
        data.curERP.fileName = data.curFileName;
        console.log(data.curERP);

        // If we only have 1 bin, the JSON might have it as a single object,
        // rather than an array. So make it an array.
        if(!Array.isArray(data.curERP.bins)) data.curERP.bins = [data.curERP.bins];

        // If we haven't selected bins, select them all
        if(data.config.selectedBins.length === 0) {
            data.config.selectedBins = data.curERP.bins.map((d,i) => true);
            data.config.selectedBinCount = data.config.selectedBins.length;
        }

        // Set current bin if necessary
        if(data.curBinIndex < 0) {
            data.curBinIndex = data.curERP.bins.length-1;
            while(data.curBinIndex>0 && !data.config.selectedBins[data.curBinIndex]) data.curBinIndex-=1;
        } else {
            while(data.curBinIndex<data.config.selectedBins.length-1 && !data.config.selectedBins[data.curBinIndex]) data.curBinIndex+=1;
        }

        // If we have channel names, select those
        if(data.config.selectedChanNames.length > 0) {
            data.config.selectedChannels = data.config.selectedChanNames.map(x => data.curERP.chans.indexOf(x));

            // If we don't find any of the channels, we'll need to redo this
            // Remove any -1 from our array
            for(var ir=data.config.selectedChannels.length-1; ir>=0; ir--){
                if(data.config.selectedChannels[ir]==-1) data.config.selectedChannels = data.config.selectedChannels.splice(ir,1);
            }
            data.curERP.selectedChannels = data.config.selectedChannels;
            if(data.config.selectedChannels.length < 1) data.config.selectedChanNames = [];
        }

        // If we don't have chan names, default to non E## channels
        if(data.config.selectedChanNames.length==0) {
            var chanRegex = /E\d+/;
            data.config.selectedChannels = [];
            for(var i=0; i < data.curERP.chans.length; i++) {
                if(!chanRegex.test(data.curERP.chans[i])) {
                    data.config.selectedChanNames.push(data.curERP.chans[i]);
                    data.config.selectedChannels.push(i);
                }
            }

            // Update selectedChannels
            data.curERP.selectedChannels = data.config.selectedChannels;

            data.onConfigUpdate(data.config);
        }

        // Estimate the "important" channels, ie ones not named E##
        // If there are none, pick the middle channel arbitrarily
        // if(data.config.selectedChannels.length != data.curERP.chans.length) {
        //     var chanRegex = /E\d+/;
        //     data.curERP.selectedChannels = [];
        //     for(var i=0; i < data.curERP.chans.length; i++) {
        //         if(!chanRegex.test(data.curERP.chans[i])) {
        //             data.curERP.selectedChannels.push(i);
        //         }
        //     }
        //     data.config.selectedChannels = data.curERP.selectedChannels;
        //     data.onConfigUpdate(data.config);
        // } else {
        //     data.curERP.selectedChannels = data.config.selectedChannels;
        // }
        // console.log(data.curERP.selectedChannels);

        // Get our important channel names
        // data.curERP.selectedChanNames = data.config.selectedChannels.map(x => data.curERP.chans[x]);

        data.onNewERPFile(data.curERP);
        data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);

        data.onChanSelect(data.curERP.selectedChannels, data.curERP.chans, data.curERP.chanlocs);
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
    data.onNewBin = function(bin, selectedChannels) {
        console.log('Changed the current bin!');
        console.log(bin);
    };


    // For navigating bins, files
    data.getBinNames = function() {
        if(!data.curERP.bins) return [];

        return data.curERP.bins.map(b => b.name);
    };
    data.selectBin = function(index) {
        if(index < 0 || index >= data.curERP.bins.length) return;
        if(index === data.curBinIndex) return;

        data.curBinIndex = index;
        data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);
    };

    data.prevBin = function() {
        console.log("prev Bin");
        if(data.curBinIndex === 0) {
            data.prevFile();
        } else {
            data.curBinIndex -= 1;
            if(!data.config.selectedBins[data.curBinIndex]) {
                data.prevBin();
            } else {
                data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);
            }
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
            if(!data.config.selectedBins[data.curBinIndex]) {
                data.nextBin();
            } else {
                data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);
            }
        }
    };

    data.nextFile = function() {
        if(data.curFileIndex < data.fileList.length-1) {
            data.curFileIndex += 1;
            data.curBinIndex = 0;
            data.loadCurrentFile();
        }
    };

    // Function to update the config
    data.setConfig = function(key, value) {
      data.config[key] = value;
      if(key == 'selectedChanNames') data.recalculateSelectedChans();
    };

    // Peaks!

    // Clears the current picked peaks. If you want to record them first,
    // call savePeaks
    data.clearPeaks = function() {
        data.pickedPeaks = [];
        data.clearTempPeaks();
    };

    // Reloads saved peaks if they're there
    data.checkForOldPeaks = function() {
        if(data.peakArchive.length > data.curFileIndex &&
            data.peakArchive[data.curFileIndex].length > data.curBinIndex) {
            data.pickedPeaks = data.peakArchive[data.curFileIndex][data.curBinIndex].slice();
        }
    };

    // Pushes our current picked peaks into the archive
    // Has callback for sending to elsewhere as well
    // Our peak archive is a list of files, each files holding their bins,
    // each bin having its peaks
    data.savePeaks = function() {
        // Make sure we have an array for the file
        while(data.peakArchive.length <= data.curFileIndex) data.peakArchive.push([]);

        // Make sure it has the right amount of bins
        while(data.peakArchive[data.curFileIndex].length < data.curERP.bins.length)
            data.peakArchive[data.curFileIndex].push([]);

        // Finally, update our current bin
        if(data.peakArchive[data.curFileIndex][data.curBinIndex].length === 0) {
            data.listProgress += 1/data.config.selectedBinCount;
        } else {
            // We're modifying this, keep note of that for future uploads
            // Alternatively just do it all at th end
            // Want to keep a saved file for recovery just in case if that's the case
            data.modified.push([data.curFileIndex, data.curBinIndex]);
        }
        data.peakArchive[data.curFileIndex][data.curBinIndex] = data.pickedPeaks;

        data.onSave(data.pickedPeaks);

        if(Math.abs(1-data.getProgress()) < 0.0001) {
            data.onComplete();
        }
    };

    // Updates the notes field for all current picked peaks
    data.updateNotes = function(newNotes) {
        for(var i=0; i<data.pickedPeaks.length; i++) {
            data.pickedPeaks[i].notes = newNotes;
        }
        // console.log(data.pickedPeaks);
    };

    // Callback for when peaks are saved
    // Accepts an array of the peaks that were saved
    data.onSave = function(savedPeaks) {
        console.log('Peaks were saved');
        console.log(savedPeaks);
    };

    // Callback for completing our files
    data.onComplete = function(){
        console.log("Finished list!");
    };

    // Updates our record of which peaks we've uploaded
    // Want our count to be of files, which is hard to do this way
    // so, we'll do it a bit more jankily
    data.markUploaded = function(count) {
        if(count <= 0) return;
        console.log(data.lastUpload);
        data.uploadedCount = data.lastUpload;

        data.modified = [];
    };

    /**
        Calculates the positive or negative peak in a time range
        Applies to a single channel
        Returns (lat, amp) of found peak, or None
        Also saves the full peak information internally

        Params:
            peakType should be 1 for positive, 2 for negative
            timeRange should be in ms
            channel should be the index of the channel
            curRoundInd is the offset for our current highlight
    */
    data.calcPeak = function(peakType, timeRange, channel, curRoundInd=0)
    {
        var chanData = data.curERP.bins[data.curBinIndex].data[channel];
        const t = data.curERP.times;

        // How many points before and after we check to make sure we're a "peak"
        var neighbors = 3;

        // Translate our time in ms to indicies in our data arrays
        var indicies = [t.indexOf(Math.round(timeRange[0])),
            t.indexOf(Math.round(timeRange[1]))];
        if(indicies[0]<neighbors) indicies[0] = neighbors;
        if(indicies[1]>t.length-neighbors) indicies[1] = t.length-neighbors;

        // console.log(timeRange, indicies, data.curERP.times[indicies[0]], data.curERP.times[indicies[1]]);

        //var peakAmps = [];
        var peakLats = [];
        var curExtreme = peakType==1 ? -999 : 999;

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
            if(peakType == 1)
            {
                if(v > meanL && v > meanR &&
                    v > chanData[i-1] && v > chanData[i+1])
                {
                    // We found a new positive peak
                    // If it's >= current extreme, then we save it
                    if(v > curExtreme)
                    {
                        curExtreme = v;
                        peakLats = [t[i]];
                    }
                    else if(v == curExtreme)
                    {
                        peakLats.push(t[i]);
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
                    peakLats = [t[i]];
                }
                else if(v == curExtreme)
                {
                    peakLats.push(t[i]);
                }
            }
        }

        // If we have multiple latencies, we'll use the mean
        // Note that this is only used if we found multiple peaks with the same amp
        // But also with 3 lesser points in between, so really probs not going to happen
        if(peakLats.length > 1)
        {
            var mid = Math.round(peakLats.reduce((a,b) => a+b)/peakLats.length);
            peakLats = [mid];
        }
        // Return null if no peaks found
        else if(peakLats.length < 1)
        {
            return [];
        }

        // Construct our peak object, push it into our picked peaks
        const now = new Date(Date.now());
        var peak = {
            record_id: data.peakIndexCounter + curRoundInd,
            filename: data.curFileName,
            peakpolarity: peakType,
            latency: peakLats[0],
            amplitude: curExtreme,
            bin: data.curERP.bins[data.curBinIndex].name,
            chan: data.curERP.chans[channel],
            timestamp: now.toUTCString(),
            startTime: timeRange[0],
            endTime: timeRange[1],
            notes: "",
        };
        data.tempPeaks.push(peak);
        //data.peakIndexCounter += 1; -> moved to saveTempPeaks

        return peak;
    };

    // For picking peaks in all picked channels
    data.calcPeaks = function(peakType, timeRange) {
        var count = 0;
        for(var i=0; i < data.curERP.selectedChannels.length; i++) {
            data.calcPeak(peakType, timeRange, data.curERP.selectedChannels[i], i);
            count += 1;
        }
    };

    // Moves current temp peaks into picked peaks, barring duplicates
    data.keepTempPeaks = function() {
        var j;
        for(var i=0; i<data.tempPeaks.length; i++) {
            // Check against all pickedPeaks
            // Make sure we're not a duplicate
            var duplicate = false;
            for(j=0; j<data.pickedPeaks.length; j++) {
                if(data.tempPeaks[i].amplitude === data.pickedPeaks[j].amplitude &&
                  data.tempPeaks[i].latency === data.pickedPeaks[j].latency &&
                  data.tempPeaks[i].chan === data.pickedPeaks[j].chan) {
                    duplicate = true;
                    break;
                }
            }

            if(!duplicate) {
                data.pickedPeaks.push(data.tempPeaks[i]);
                data.peakIndexCounter += 1;
            }
        }

        data.clearTempPeaks();
        data.onGetPeaks();
    };

    // Callbacks for disabling / enabling the peak export button
    // This kind of hting is where vue / react are much nicer to use
    data.onGetPeaks = function() {

    };

    data.onEmptyPeaks = function() {

    };

    // Deletes one of the current peaks by record id
    data.deletePeakByRecordID = function(r_id) {
        data.pickedPeaks = data.pickedPeaks.filter( x => x.record_id!=r_id);
    };

    // Clears all the tempPeaks we had
    data.clearTempPeaks= function() {
        data.tempPeaks = [];
    };

    // Gets our peaks as a JSON string
    // Only returns files with index >= from
    data.getPeaksAsJSON = function(from)
    {
        if(data.uploadedCount >= data.peakArchive.length) return "[]";

        var ourPeaks = data.peakArchive.slice(from);
        var arrayToSend = [];
        for(var i=0; i<ourPeaks.length; i++) {
            arrayToSend = arrayToSend.concat(ourPeaks[i].reduce((a,b)=>a.concat(b)));
        }

        // Add any modified
        for(i=0; i < data.modified.length; i++) {
            arrayToSend = arrayToSend.concat(data.peakArchive[data.modified[i][0]][data.modified[i][1]]);
        }

        return JSON.stringify(arrayToSend, (",",":"));
    };

    // For uploading to RedCap, assumes we're being called after a file has just been
    // Completed (in terms of all bins picked)
    // We upload at each file, rather than each bin for easier keeping track
    data.getUpload = function(){
        data.lastUpload = data.peakArchive.length;
        return data.getPeaksAsJSON(data.uploadedCount);
    };

    // Returns out pos and neg peaks
    // Includes temp peaks
    data.getPickedPeaks = function(positive=true) {
        const temps = data.tempPeaks.filter(p => p.peakpolarity==(positive ? 1 : 2));
        return data.pickedPeaks.filter(p => p.peakpolarity==(positive ? 1 : 2)).concat(temps);
    };

    // Exports peak archive + current picked peaks to a csv string for download
    data.exportToCSV = function() {
        // Grab all the archived peaks
        var arrayToSend = [];
        for(var i=0; i<data.peakArchive.length; i++) {
            arrayToSend = arrayToSend.concat(data.peakArchive[i].reduce((a,b)=>a.concat(b)));
        }

        // Add current peaks
        arrayToSend = arrayToSend.concat(data.pickedPeaks);

        // transform into csv
        // pulled from https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        const header = Object.keys(arrayToSend[0]);
        let csv = arrayToSend.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        csv = csv.join('\r\n');

        const csvBlob = new Blob([csv], {type:'txt/csv'});
        // get the peaksdate time.
        downloadBlob(csvBlob, "peaks_".concat(Date.now(),"_.csv"));
    };

    data.getProgress = function() {
        return data.listProgress / data.fileList.length;
    };

    data.getSelectedChans = function(){
        return data.curERP.selectedChannels;
    };

    // Returns index of channel with respect its class (selected or not)
    data.getSelLoc = function(index){
        const s = data.curERP.selectedChannels.includes(index);
        return {
            sel: s,
            index: data.curERP.chans.map((d,i) => i)
                .filter((d,i) => data.curERP.selectedChannels.includes(i) == s)
                .indexOf(index)
        };
    };

    data.getCurBinData = function(){
        if(!data.curERP.bins) return [];

        return data.curERP.bins[data.curBinIndex];
    };

    // Selecting channels
    data.toggleChannel = function(chIndex) {
        //console.log(chIndex);
        if(chIndex < 0 || chIndex >= data.curERP.chans.length) return;

        if(data.curERP.selectedChannels.includes(chIndex)) {
            var ind = data.curERP.selectedChannels.indexOf(chIndex);
            if(ind < data.curERP.selectedChannels.length-1) {
                data.curERP.selectedChannels[ind] = -1;
            } else {
                data.curERP.selectedChannels.pop();
            }

            // Purge any peaks from this channel from picked peaks
            for(var p=data.pickedPeaks.length-1; p>=0; p--) {
                if(data.pickedPeaks[p].chan === data.curERP.chans[chIndex]) {
                    data.pickedPeaks.splice(p,1);
                }
            }
        } else {
            var foundSpot = false;
            for(var i = 0; i < data.curERP.selectedChannels.length; i++) {
                if(data.curERP.selectedChannels[i]==-1) {
                    foundSpot = true;
                    data.curERP.selectedChannels[i] = chIndex;
                    break;
                }
            }
            if(!foundSpot) data.curERP.selectedChannels.push(chIndex);
        }
        data.onChanSelect(data.curERP.selectedChannels, data.curERP.chans, data.curERP.chanlocs);
    };

    data.onChanSelect = function(sel, names, locs) {
        console.log('Changed the selected channels!');
    };

    return data;
}
