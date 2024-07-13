const fs = require('fs');
const path = require('path');

// Get the target browser from command line arguments
const targetBrowser = process.argv[2];

if (!targetBrowser) {
  console.error('Please specify a target browser: "chrome" or "firefox".');
  process.exit(1);
}

const publicFolder = path.join(__dirname, 'public');
const browserFolder = path.join(__dirname, 'browsers')

// Define the source and destination file mappings for each browser
const fileMappings = {
  chrome: {
    manifest: 'chrome-manifest.json',
    index: 'chrome-index.html'
  },
  firefox: {
    manifest: 'firefox-manifest.json',
    index: 'firefox-index.html'
  }
};

// Ensure the target browser is valid
if (!fileMappings[targetBrowser]) {
  console.error('Invalid target browser specified. Use "chrome" or "firefox".');
  process.exit(1);
}

// Copy the manifest.json file
fs.copyFile(
  path.join(browserFolder, fileMappings[targetBrowser].manifest),
  path.join(publicFolder, 'manifest.json'),
  (err) => {
    if (err) {
      console.error('Error copying manifest.json:', err);
      process.exit(1);
    }
    console.log(`Successfully copied ${fileMappings[targetBrowser].manifest} to manifest.json`);
  }
);

// Copy the index.html file
fs.copyFile(
  path.join(browserFolder, fileMappings[targetBrowser].index),
  path.join(publicFolder, 'index.html'),
  (err) => {
    if (err) {
      console.error('Error copying index.html:', err);
      process.exit(1);
    }
    console.log(`Successfully copied ${fileMappings[targetBrowser].index} to index.html`);
  }
);