const path = require('path');
const {fetchKitPlan, initAppFolder, generateApp } = require('../src/index');

const appName = process.argv[2];
const rootDir = path.resolve('.');
const kitName = process.argv[3];

(async () => {
  const kitPlan = {
    name: 'react',
    patterns: [
      { "from": ["package.json", "webpack.config.js"], "to": "" },
      { "from": ["src/index.html", "src/index.jsx", "src/style.css"], "to": "src" },
      { "from": "img/favicon.ico", "to": "src", "kit": "commons" },
      { "from": "img/rocket.svg", "to": "src/img", "kit": "commons" }
    ],
  };
  
  //await fetchKitPlan(kitName);
  const { appRoot } = initAppFolder(rootDir, appName);
  await generateApp(appRoot, kitPlan);
})();