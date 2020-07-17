---
title: 'PeakPicker, a rapid ERP peak picking tool for developmental cognitive neuroscience'
tags:
  - cognitive neuroscience
  - Event related Potentials
authors:
  - name: Adam Naples
    affiliation: 1
  - name: Carter Carlos
    affiliation: 1
  - name: Takumi McCalister
    affiliation: 1
  - name: James McPartland
    affiliation: 1
affiliations:
  - name: Child Study Center, Yale University School of Medicine
    index: 1
date: 3 June 2020
bibliography: paper.bib
---

# Summary


## what's an ERP
Developmental cognitive neuroscience research is concerned with understanding the mechanisms in brain that guide behavior and how these mechanisms change throughout development. Electroencephalography (EEG) is a direct measure of cortical activity at the scalp,  has been used for decades in both clinical and research practice, and is one of the most commonly used  and easily accessible neuroimaging tools in developmental research.  Event related potentials (ERPS) are EEG waveforms that are measured in response to distinct events, such as a sound or appearance of an image, and provide millisecond resolution information about the neural processing of that event. These ERPs exhibit reliable waveforms with peaks and troughs that index different cognitive processes. Figure 1 shows a prototypical waveform that is measured from a simple visual experiment where participants viewed a checkerboard reversal. Approximately 100ms after the reversal there is a large positive peak followed by a large negative peak (although technically not a peak because it is negative, it is standard in the field to refer to these extrema as "peaks"). These peaks are the primary unit of measurement in ERP research and clinical practice and their amplitude, measured in microvolts,  and latencies, in milliseconds (ms) are the dependent variables used in subsequent data analyses.

## why do automated methods fail and we and up doing this anyway
With research studies enrolling increasingly larger sample sizes, the identification and quantification of these peaks has been handed off to automated programs. However, the morphology of these peeks varies significantly, particularly in clinical and developmental populations, and automated tools often fail to estimate all the peaks correctly. Unfortunately, if a researcher knows that an automated procedure has failed once, then all of the data must be manually validated. This results in an inefficient and often frustrating ad-hoc workflow of checking and manually correcting the computer's work. A solution to this problem is to simply manually validate each peak from the start. But again, there are no readily available tools that facilitate this process and ad-hoc solutions typically lack flexibility, speed, or convenience.

## speed and convenience
 ["Fast software is the best software"](https://craigmod.com/essays/fast_software/). To address this problem we present peakpicker. A web based tool for easily and quickly picking ERP peaks. Our goal was to create a tool that to streamline the ERP peak picking process to increase throughput while reducing the kinds of errors that come from manually cutting and pasting values among different software programs. Towards that end we focused on the following goals


## easy to install
Installing and using open source software is not always easy and (ref) for various reasons, users might be unable or unwilling to install custom software or navigate complex dependencies. However, most users have web browsers.  PeakPickers operates within a web browser and you can try it here{http://locuscoerule.us/WEPP}. Importantly, while the web page can be hosted remotely, all processing of data happens locally on the users computer. For users who do not have access to external sites they can also download the github package and run the program locally, which we have tried to make as easy as possible.

## easy to use
The peak picker program shows a picture of the ERP waveforms and the user uses the mouse to select the peaks that they want to measure.
A workflow looks like this:
  - the user selects a local directory of data files that represent individual ERP averages that are formatted as described in the documentation.
  - peak picker displays the butterfly plot for the first file and the user selects which electrodes they want to peak peaks from.
  - the user then selects the relevant peaks
  - the user then presses space to cycle to the next experimental condition for that file, or the next file if  a file is complete.
  - after selecting all of the files. the user can choose to either download the results to a local text file or automatically upload them to a REDcap database or a google sheet.


## easy data to deal with
Data are exported in a long format with an amplitude, latency, channel, and other identifying information for each row.   We include a timestamp with each pick so that if multiple users combine or share work it is possible to disambiguate the source of the data. We explicitly do not make assumptions about the kinds of ERP peaks that the user might measure e.g, P100 or N170. It is up to the user to organize their data in a suitable format later. We believe that this approach is preferable for a variety of reasons:
  - Long format data is typically easier to reshape in statistical software programs
  - The same peak can be picked multiple times by different raters to assess interrater reliability
  - Some ERPs may have more or fewer peaks than expected.


## easy to import data
Peakpicker uses data that are stored in Javascript Object Notation (JSON) format for storing ERP data and relevant metadata.
Currently the only data that we use are:
- The ERP amplitudes
- The sample time indices in ms i.e., [1,2,3,4,5]
- The experimental condition e.g., face, house, good sound, scary sound.
- The channel names and locations (although it works fine if you don't have the locations)
We provide Matlab and Python scripts for reformatting ERPLAB (ref) 'ERP' files and instructions for formatting netstation individual averaged files for import as these are the formats that we have the most experience with and are common in the field. However, we are happy to collaborate with users of other systems to support importing ERP files from other formats. 


# Conclusion.
Peakpicker is a tool with an immediate need. Picking the peaks was not the hard part, the hard part was tracking the picked peaks and replacing unstable workflows that often relied on cutting and pasting among multiple pieces of software. PeakPicker is released under the BSD3 (is this right) license and built upon on the following dependencies D3, Node, etc. Funding for the development of peakPicker was supported by NIMH grants R01 MCP U19 MCP and R21 MCP/NAPLES




We present a case study of its use on developmental data, present a walkthrough and demo data, and link to the program and code freely available online.
