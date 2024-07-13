const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function copyDirectory(src, dest) {
  try {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error(`Error copying directory from ${src} to ${dest}:`, err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const browser = args[0];

  if (browser !== 'chrome' && browser !== 'firefox') {
    console.error('Invalid argument. Please specify either "chrome" or "firefox".');
    process.exit(1);
  }

  const srcDir = path.join(__dirname, 'browsers', browser);
  const destDir = path.join(__dirname, 'public');

  try {
    await copyDirectory(srcDir, destDir);
    console.log(`Successfully copied ${browser} directory to public/`);
  } catch (err) {
    console.error('Error during copy operation:', err);
  }
}

main();