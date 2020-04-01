%% Just opens a directory, then exports all the ERPs as JSON
function jsonExport(fileDir, outputFolder)
    eeglab nogui;

    %fileDir = 'data/erp/';
    filesD = dir([fileDir '/*.erp']);
    files = {filesD(:).name};

    setFilePaths = {};
    fileCount = 0;
    totalFiles = size(files,2);
    %outputFolder = 'data/json/';
    
    if ~exist(outputFolder, 'dir')
       mkdir(outputFolder)
    end
    if outputFolder(end) ~= '/'
        outputFolder = [outputFolder '/'];
    end

    for erpFileName = files
        fileCount = fileCount + 1;
        
        if mod(fileCount,20)==0
            disp(100*(fileCount/totalFiles));
        end
        
        % Read in the erp file
        erpFile=erpFileName{1};
        [p outName fExt] = fileparts(erpFile)

        ERP = pop_loaderp( 'filename', erpFile, 'filepath', fileDir);

        % Create our own object with less junk
        expERP = [];
        expERP.chans = {ERP.chanlocs(:).labels};
        expERP.bins = [];
        for b = 1:ERP.nbin
            expERP.bins(b).name = ERP.bindescr{b};
            expERP.bins(b).data = ERP.bindata(:,:,b);
            expERP.bins(b).good = ERP.ntrials.accepted(b);
            expERP.bins(b).bad = ERP.ntrials.rejected(b);
        end
        expERP.sampleRate = ERP.srate;
        expERP.times = ERP.times;
        expERP.xmin = ERP.xmin;
        expERP.xmax = ERP.xmax;

        s = jsonencode(expERP);
        fid = fopen([outputFolder outName '.json'], 'w');
        fprintf(fid,s);
        fclose(fid);
    end
end