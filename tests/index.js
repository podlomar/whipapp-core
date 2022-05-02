const path = require('path');
const { fetchKitPlan, initAppFolder, generateApp } = require('../src/index');

const SERVER_URL = 'https://podlomar.github.io/whipapp-kits';

const appName = process.argv[2];
const rootDir = path.resolve('.');
const kitName = process.argv[3];

(async () => {
  // const kitPlan = {
  //   name: 'react',
  //   patterns: [
  //     { "from": ["package.json", "webpack.config.js"], "to": "" },
  //     { "from": ["src/index.html", "src/index.jsx", "src/style.css"], "to": "src" },
  //     { "from": "img/favicon.ico", "to": "src", "kit": "commons" },
  //     { "from": "img/rocket.svg", "to": "src/img", "kit": "commons" }
  //   ],
  // };

  const kitPlan = await fetchKitPlan(kitName, SERVER_URL);
  if (kitPlan.status === 'error') {
    console.error('ERROR:', kitPlan.message);
    return;
  }

  const result = initAppFolder(rootDir, appName);
  if (result.status === 'error') {
    console.error('ERROR:', result.message);
    return;
  }

  await generateApp(result.appRoot, kitPlan);
})();
