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



Developmental cognitive neuroscience research is concerned with understanding the mechanisms in brain that guide behavior and how these mechanisms change throughout development. Electroencephalography (EEG)is a direct measure of cortical activity at the scalp and has been used for decades in both clinical and research practice and is the most commonly used neuroimaging tool in developmental research.  Event related potentials (ERPS) are EEG waveforms that are measured in response to distinct events, such as a sound or appearance of an image, and provide miillisecond resolution information about the neural processing of that event. These ERPs exhibit reliable waveforms with peaks and troughs that index different cognitive processes. Figure 1 shows a prototypical waveform that is measured from a simple visual experiment where participants viewed a checkerboard reversal. Approximately 100ms after the reversal there is a large positive peak followed by a large negative peak (although technically not a peak because it is negative, it is standard in the field to refer to these extrema as "peaks"). These peaks are the primary unit of measurement in ERP research and clinical practice and their amplitude, measured in microvolts,  and latencies, in milliseconds (ms) are the dependent variables used in subsequent data analyses.

With research studies enrolling increasingly larger sample sizes, the identification and quantification of these peaks has been handed off to automated programs. However, the morphology of these peeks varies significantly in terms of amplitude and latency particularly in clinical and developmental populations and automated tools often fail to estimate all the peaks correctly. unfortunately, if a researcher knows that an automated procedure has failed once, then all of the data must be manually validated. This results in an inefficient and often frustrating ad-hoc workflow of checking and manually correcting the computer's work. A solution to this problem is to simply manually validate each peak from the start.  But again, there are no readily available tools that facilitate this process and ad-hoc solutions typically lack flexabiliity and need to be rebuilt for slightly different needs.

To address this problem we present peakpicker. A web based tool for easily and rapidly picking ERP peaks. Our goal was to create a tool that to streamline the ERP peak picking process to increase throughput while reducing the kinds of errors that come from manually cutting and pasting values among different software programs. Towards that end we focused on the following design principles.

# easy to install
Installing and using open source software is one of the largest hurdles to people adopting it's use (ref). For various reasons, users might be unable or unwilling to install custom software or navigate complex dependencies for installation. However, most users have web browsers and we have developed peakPicker to operate within a web browser available here {http://locuscoerule.us/WEPP}. Importantly, while the web page is hosted remotely, all processing of data happens locally on the users computer. For users who do not have access to external sites they can also download the github package and run the program locally.

# easy to use
the peak picker workflow is as follows
  - the user selects a local directory of data files that are formatted for 
Peakpicker does only one thing. it visualizes an ERP waveform across a sete of user selected electrodes and lets the user drag the mouse over the peaks to select them.

 which then requires researchers to individually validate all of the peaks l

. Importantly in clinical or developmental populations, where the underlying neural mechanisms may vary significantly in their activity, the morphology  of waveforms exhibit substantial variability.

In reseearch, EEG is often used to measure neural processing of distinct events external events such as images or sounds. The EEG measured to these distinct events are known as event related potentials (ERPS) and are calculated from averaging EEG activity time-locked to an external event, such as the appearance of a visual stimulus. These ERPs exhibit reliable waveforms with peaks and troughs that index different cognitive processes. Figure 1 shows a prototypical waveform that is measured from a simple visual experiment where participants viewed a checkerboard reversal. Approximately 100ms after the reversal there is a large positive peak followed by a large negative peak (although technically not a peak because it is negative, it is standard in the field to refer to these extrema as "peaks"). These peaks are the primary unit of measurement in ERP research and clinical practice and their amplitude, measured in microvolts,  and latencies, in milliseconds (ms) are the dependent variables used in subsequent data analyses.

Event related potentials are typically presented as grand averaged wave forms that average data across multiple trials and multiple participants to present an idealized time course of cortical activity across a study. However, averages across trials at the individual level, where measurements are made, only occasionally approach this ideal, and in clinical or developmental populations, where the underlying neural mechanisms may vary significantly in their activity, the morphology  of waveforms exhibit substantial variability.

This presents a problem for automated methods of extracting ERP peak related activity, as the automated methods can fail to capture the appropriate peaks. This is particularly a problem when peaks are defined relative to other waveform features, e.g., the 2nd negative peak after the first positive peak. To solve this problem we present tool for rapid manual peak annotation. The utility of peak picker is in its speed and ease of use. Typically, individual peak picking is tedious and error prone task, thus the interface and design of peak picker is optimized for high throughput rapid Dependent variable abstraction. Furthermore, the extracted dependent variables allow for multiple peaks within a single time range which allow researchers to explore unique ERP morphology that may occur in psychiatric  or developmental populations. Finally to facilitate ease of use.


Peakpicker is a web application that operates within a web broser to allow researchers to rapidly and easily pick peaks.

By operating in a web browser, researchers do not need to install specific software, they only need to have their data formatted as a JSON object. We provide instructions for converting common ERPlab and NEtstation individual averages to JSON. Importantly, while the program oerates on a web browser, no data is transfererd outside of the users machine unless they explictly request it. The web browser simply acts as a platform for the peak picking program.

PeakPicker has been developed to operate within a web browser so that researchers do not need to install specific software.


We present a case study of its use on developmental data, present a walkthrough and demo data, and link to the program and code freely available online.
