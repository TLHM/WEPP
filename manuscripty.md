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
  - name: Takumi McAllister
    affiliation: 1
  - name: James McPartland
    affiliation: 1
affiliations:
  - name: Child Study Center, Yale University School of Medicine
    index: 1
date: 3 June 2020
bibliography: paper.bib

---


- The paper should be between 250-1000 words.
- A list of the authors of the software and their affiliations, using the correct format (see the example below).
- A summary describing the high-level functionality and purpose of the software for a diverse, non-specialist audience.
- A clear Statement of Need that illustrates the research purpose of the software.
- A list of key references, including to other software addressing related needs.
- Mention (if applicable) a representative set of past or ongoing research projects using the software and recent scholarly publications enabled by it.
- Acknowledgement of any financial support.

# Summary



naples, carlos, mcallister, mcpartland

PeakPicker, a rapid ERP peak picking tool for developmental cognitive neuroscience

Electroencephalography (EEG) is a direct measure of cortical activity at the scalp and has been used for decades in both clinical and research practice. As a research tool, EEG is often used to measure neural processing of distinct events. The EEG measured to these distinct events are known as event related potentials (ERPs) and are calculated from averaging EEG activity time-locked to an external event, such as the appearance of a visual stimulus. These ERPs exhibit reliable waveforms with peaks and troughs that index different cognitive processes. Figure 1 shows a prototypical waveform that is measured from a simple visual experiment where participants viewed a checkerboard reversal. Approximately 100ms after the reversal there is a large positive peak followed by a large negative peak (although technically not a peak because it is negative, it is standard in the field to refer to these extrema as "peaks"). These peaks are the primary unit of measurement in ERP research and clinical practice and their amplitude, measured in microvolts,  and latencies, in milliseconds (ms) are the dependent variables used in subsequent data analyses.

Event related potentials are typically presented as grand averaged wave forms that average data across multiple trials and multiple participants to present an idealized time course of cortical activity across a study. However, averages across trials at the individual level, where measurements are made, only occasionally approach this ideal, and in clinical or developmental populations, where the underlying neural mechanisms may vary significantly in their activity, the morphology of waveforms exhibit substantial variability.

This presents a problem for automated methods of extracting ERP peak related activity, as the automated methods can fail to capture the appropriate peaks. This is particularly a problem when peaks are defined relative to other waveform features, e.g., the 2nd negative peak after the first positive peak. To solve this problem we present tool for rapid manual peak annotation. The utility of peak picker is in its speed and ease of use. Typically, individual peak picking is tedious and error prone task, thus the interface and design of peak picker is optimized for high throughput rapid dependent variable abstraction. Furthermore, the extracted dependent variables allow for multiple peaks within a single time range which allow researchers to explore unique ERP morphology that may occur in psychiatric or developmental populations.

Peakpicker is a web application that operates within a web broser to allow researchers to rapidly and easily pick peaks.

By operating in a web browser, researchers do not need to install specific software, they only need to have their data formatted as a JSON object. We provide instructions for converting common ERPlab and Netstation individual averages to JSON. Importantly, while the program operates in a web browser, no data is transfererd outside of the users machine unless they explictly request it. The web browser simply acts as a platform for the peak picking program.


We present a case study of its use on developmental data, present a walkthrough and demo data, and link to the program and code freely available online.
