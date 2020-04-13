# WEPP
Browser based tool for manual peak picking for ERP data.

- The paper should be between 250-1000 words.
- A list of the authors of the software and their affiliations, using the correct format (see the example below).
- A summary describing the high-level functionality and purpose of the software for a diverse, non-specialist audience.
- A clear Statement of Need that illustrates the research purpose of the software.
- A list of key references, including to other software addressing related needs.
- Mention (if applicable) a representative set of past or ongoing research projects using the software and recent scholarly publications enabled by it.
- Acknowledgement of any financial support.


---
##Dev Setup

For development, you will need node and npm installed. They should also be updated (node v12.16.2, npm 6.14.4).

Then, simply go to the directory in a terminal and run `npm install`, which will install the necessary packages for the project.

The project uses webpack, along with babel, for things like running the dev server and creating a better production files. The setup was done with help from [this article](https://code.likeagirl.io/how-to-set-up-d3-js-with-webpack-and-babel-7bd3f5e20df7), though it is slightly outdated (eg need @babel/preset-env, not babel-preset-env, and "@babel/preset-env" for the presets in the .babelrc). The [documentation for webpack](https://webpack.js.org/concepts/) was also very helpful for setting up aspects of its functionality, and is recommended for anyone looking to understand what it does, and how to get it to do more.

To build the production version, use the command `npm run build`.