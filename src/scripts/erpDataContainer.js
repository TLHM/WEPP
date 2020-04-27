/*jshint esversion: 6 */

/**
  Responsible for loading and holding all the ERP data, as well as
  switching between files, holding project configuration, etc.
*/

export default function erpDataContainer() {
    var data = {
        reader: new FileReader(),
        fileList: [],
        listProgress: 0,
        confFil: {},
        config: {
            redcapURL: 'https://poa-redcap.med.yale.edu/api/',
            redcapToken: '',
            selectedChannels: [],
            defaultWindows: [],
            selectedBins: [],
            selectedBinCount: [],
        },
        curFileIndex : 0,
        curBinIndex: 0,
        curERP: {},
        tempPeaks: [],  // Holds peaks until highlight is finalized
        pickedPeaks: [], // Holds peaks for current bin that we've picked
        peakArchive: [], // Holds peaks for current session
        uploadedCount: 0,
        peakIndexCounter: 0,
    };

    // Called when we get a new batch of files to load
    // Saves the list for further use, loads first file (if there is one)
    data.loadList = function(flist) {
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
            data.loadConfig(data.confFile);
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

    data.loadJSON = function(jsonData, name) {
        data.curERP = jsonData;
        data.curERP.fileName = data.curFileName;

        // If we haven't selected bins, select them all
        if(data.config.selectedBins.length === 0) {
            data.config.selectedBins = data.curERP.bins.map((d,i) => true);
            data.config.selectedBinCount = data.config.selectedBins.length;
        }

        // Set current bin if necessary
        if(data.curBinIndex < 0) {
            data.curBinIndex = data.curERP.bins.length-1;
        }

        // Estimate the "important" channels, ie ones not named E##
        // If there are none, pick the middle channel arbitrarily
        if(data.config.selectedChannels.length != data.curERP.chans.length) {
            var chanRegex = /E\d+/;
            data.curERP.selectedChannels = data.curERP.chans.map(x => !chanRegex.test(x));
            data.config.selectedChannels = data.curERP.selectedChannels;
        } else {
            data.curERP.selectedChannels = data.config.selectedChannels;
        }

        // Get our important channel names
        data.curERP.selectedChanNames = data.curERP.chans.filter((d, ind) => data.config.selectedChannels[ind]);

        data.onNewERPFile(data.curERP);
        data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);

        data.onChanSelect(data.curERP.selectedChannels, data.curERP.chans, data.curERP.chanlocs);
    };

    // Loads a specified config file
    data.loadConfig = function(confFile) {
        var confReader = new FileReader();
        confReader.onload = function(event){
            data.config = JSON.parse(event.target.result);
            data.onLoadConfig(data.config);
        };
        confReader.readAsText(confFile);
    };

    // Callback for when we load in a new configuration file
    data.onLoadConfig = function(config) {
        console.log('Loaded Config File');
    };

    // Function to update the config
    data.setConfig = function(key, value) {
        data.config[key] = value;
    };

    // Saves the config file (pops up dialog)
    data.saveConfig = function() {
        const confBlob = new Blob([JSON.stringify(data.config)], {type:'application/plsdl'});

        data.downloadBlob(confBlob, 'wepp_conf.json');
    };

    data.downloadBlob = function(blob, suggestedName='') {
        // from https://stackoverflow.com/questions/8310657/how-to-create-a-dynamic-file-link-for-download-in-javascript
        var dlink = document.createElement('a');
        dlink.style.display = 'none';
        if(suggestedName.length>0) dlink.download = suggestedName;
        //dlink.target='_blank';
        dlink.href = window.URL.createObjectURL(blob);
        dlink.onclick = function(e) {
            // revokeObjectURL needs a delay to work properly
            var that = this;
            setTimeout(function() {
                window.URL.revokeObjectURL(that.href);
            }, 1500);
        };
        document.body.appendChild(dlink);
        dlink.click();
        dlink.remove();
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

            data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);
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

            data.onNewBin(data.curERP.bins[data.curBinIndex], data.curERP.selectedChannels);
        }
    };

    data.nextFile = function() {
        if(data.curFileIndex < data.fileList.length-1) {
            data.curFileIndex += 1;
            data.curBinIndex = 0;
            data.loadCurrentFile();
        }
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
            data.pickedPeaks = data.peakArchive[data.curFileIndex][data.curBinIndex];
        }
    };

    // Pushes our current picked peaks into the archive
    // Has callback for sending to elsewhere as well
    // Our peak archive is a list of files, each files holding their bins,
    // each bin having its peaks
    data.savePeaks = function(notes) {
        // Make sure we have a file array
        while(data.peakArchive.length < data.curFileIndex) data.peakArchive.push([]);
        if(data.peakArchive.length===data.curFileIndex) data.peakArchive.push([]);

        // Make sure it has the right amount of bins
        while(data.peakArchive[data.curFileIndex].length < data.curERP.bins.length)
            data.peakArchive[data.curFileIndex].push([]);

        // Finally, update our current bin
        if(data.peakArchive[data.curFileIndex][data.curBinIndex].length === 0)
            data.listProgress += 1/data.config.selectedBinCount;
        data.peakArchive[data.curFileIndex][data.curBinIndex] = data.pickedPeaks;

        data.onSave(data.pickedPeaks);
    };

    // Updates the notes field for all current picked peaks
    data.updateNotes = function(newNotes) {
        console.log(newNotes);
        for(var i=0; i<data.pickedPeaks.length; i++) {
            data.pickedPeaks[i].notes = newNotes;
        }
        console.log(data.pickedPeaks);
    };

    // Callback for when peaks are saved
    // Accepts an array of the peaks that were saved
    data.onSave = function(savedPeaks) {
        console.log('Peaks were saved');
        console.log(savedPeaks);
    };

    // Updates our record of which peaks we've uploaded
    // Want our count to be of files, which is hard to do this way
    // so, we'll do it a bit more jankily
    data.markUploaded = function(count) {
        if(count <= 0) return;
        data.uploadedCount = data.uploading;
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

        // If we have multiple latencies, we'll use the median
        // Note that this is only used if we found multiple peaks with the same amp
        if(peakLats.length > 1)
        {
            var mid = Math.round(peakLats/2);
            peakLats = [peakLats[mid]];
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
            if(!data.curERP.selectedChannels[i]) continue;

            data.calcPeak(peakType, timeRange, i, count);
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

    // Gets our peaks as a JSON string for upload to redcap
    // Only returns those not yet uploaded
    data.getPeaksAsJSON = function()
    {
        if(data.uploadedCount >= data.peakArchive.length) return "[]";
        var ourPeaks = data.peakArchive.slice(data.uploadedCount);
        var arrayToSend = [];
        for(var i=0; i<ourPeaks.length; i++) {
            arrayToSend = arrayToSend.concat(ourPeaks[i].reduce((a,b)=>a.concat(b)));
        }
        data.uploading = data.peakArchive.length;
        return JSON.stringify(arrayToSend, (",",":"));
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
        data.downloadBlob(csvBlob, 'peaks.csv');
    };

    data.getProgress = function() {
        return data.listProgress / data.fileList.length;
    };

    data.getSelectedChans = function(){
        return data.curERP.selectedChannels;
    };

    // Returns index of channel with respect its class (selected or not)
    data.getSelLoc = function(index){
        return {
            sel: data.curERP.selectedChannels[index],
            index: data.curERP.chans.map((d,i) => i)
                .filter((d,i) => data.curERP.selectedChannels[i] == data.curERP.selectedChannels[index])
                .indexOf(index)
        };
    };

    data.getCurBinData = function(){
        return data.curERP.bins[data.curBinIndex];
    };

    // Selecting channels
    data.toggleChannel = function(chIndex) {
        //console.log(chIndex);
        if(chIndex < 0 || chIndex >= data.curERP.chans.length) return;

        data.curERP.selectedChannels[chIndex] = !data.curERP.selectedChannels[chIndex];
        data.onChanSelect(data.curERP.selectedChannels, data.curERP.chans, data.curERP.chanlocs);
    };

    data.onChanSelect = function(sel, names, locs) {
        console.log('Changed the selected channels!');
    };

    return data;
}
