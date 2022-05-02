const axios = require('axios');
const path = require('path');
const fs = require('fs');

const DEFAULT_SERVER_URL = 'https://podlomar.github.com/whipapp-kits';

function fileURL(serverURL, filePath) {
  return `${serverURL}/${filePath}`;
}

async function copy(serverURL, srcPath, destPath) {
  console.log('downloading', srcPath, '->', destPath);
  const response = await axios.get(fileURL(serverURL, srcPath), {
    responseType: 'stream',
  });
  
  const destParent = path.dirname(destPath);
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

async function fetchKitPlan(kitName, serverURL = DEFAULT_SERVER_URL) {
  const name = kitName || 'plain';
  
  try {
    const response = await axios.get(fileURL(serverURL, `kits/${name}.json`), {
      headers: {
        Accept: 'application/json',
      }
    });
    
    return {
      status: 'success',
      serverURL,
      name, 
      patterns: response.data,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        status: 'error',
        message: `Starter kit template '${kitName}' doesn't exist.`
      }
    }
    
    throw error
  }
}

function initAppFolder(rootDir, appName) {
  const appRoot = path.resolve(rootDir, appName);
  
  if (appName !== '.') {
    if (fs.existsSync(appRoot)) {
      return {
        status: 'error',
        message: `Directory '${appName}' already exists in '${rootDir}'. Can't overwrite it.`
      }
    }

    fs.mkdirSync(appRoot);
  }

  return {
    status: 'success',
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
      await copy(
        kitPlan.serverURL, 
        `${kit}/${source}`, 
        path.join(appRoot, pattern.to, srcName)
      );
    }
  }
}

module.exports = { fetchKitPlan, initAppFolder, generateApp };
