import fs from 'fs';
import path from 'path';

const FILES = [
  'container.js',
  'button.js',
  'glass.css'
];

async function downloadFile(fileName: string) {
  const urls = [
    `https://raw.githubusercontent.com/dashersw/liquid-glass-js/main/${fileName}`,
    `https://raw.githubusercontent.com/dashersw/liquid-glass-js/master/${fileName}`
  ];

  for (const url of urls) {
    console.log(`Trying to download ${fileName} from ${url}...`);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(fileName, text);
        console.log(`Successfully downloaded ${fileName} (${text.length} bytes)`);
        return true;
      } else {
        console.log(`Failed with status ${res.status} for ${url}`);
      }
    } catch (err) {
      console.error(`Error downloading from ${url}:`, err);
    }
  }
  return false;
}

async function main() {
  for (const file of FILES) {
    const success = await downloadFile(file);
    if (!success) {
      console.error(`Could not download ${file} from any URL!`);
    }
  }
}

main().catch(console.error);
