const axios = require('axios');
const path = require('path');
const fs = require('fs');

const KITS_REPO_URL = 'https://api.github.com/repos/podlomar/whipapp-kits';

function fileURL(filePath) {
  return `${KITS_REPO_URL}/contents/${filePath}`;
}

async function copy(srcPath, destPath) {
  console.log(srcPath, destPath);
  const response = await axios.get(fileURL(srcPath), {
    responseType: 'stream',
    headers: {
      Accept: 'application/vnd.github.3.raw',
    }
  });
  
  const destParent = path.dirname(destPath);
  console.log(destParent);

  fs.mkdirSync(destParent, { recursive: true});

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    
    let error = null;
    writer.on('error', (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    
    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });

    response.data.pipe(writer);
  });
};

async function fetchKitPlan(kitName) {
  const name = kitName || 'plain';
  const response = await axios.get(fileURL(`kits/${name}.json`), {
    headers: {
      Accept: 'application/vnd.github.3.raw',
    }
  });
  
  return {
    name, 
    patterns: response.data,
  };
}

function initAppFolder(rootDir, appName) {
  const appRoot = path.resolve(rootDir, appName);
  
  if (appName !== '.') {
    fs.mkdirSync(appRoot);
  }

  return {
    appRoot,
    appName: appName === '.' ? 'app' : appName,
  };
}

async function generateApp(appRoot, kitPlan) {
  for (const pattern of kitPlan.patterns) {
    const kit = pattern.kit || `kits/${kitPlan.name}`;
    const sources = Array.isArray(pattern.from) ? pattern.from : [pattern.from];
    
    for (const source of sources) {
      const srcName = pattern.name || path.basename(source);
      await copy(`${kit}/${source}`, path.join(appRoot, pattern.to, srcName));
    }
  }
}

module.exports = { fetchKitPlan, initAppFolder, generateApp };