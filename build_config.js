let fs = require('fs');
const {resolve} = require("path");
let path = resolve('./');
let fetch = require('node-fetch');

async function init () {

  const configMap = {
    'contracts-goerli': `${path}/src/contracts-qa.json`,
    'contracts_mainnet': `${path}/src/contracts-prod.json`,
    'contracts-goerli-dev': `${path}/src/contracts-dev.json`,
    'contracts-arbi-goerli': `${path}/src/contracts-arbi-goerli.json`,
    'contracts-arbi': `${path}/src/contracts-arbi.json`,
  };

  for (const key in configMap) {
    let url = `https://raw.githubusercontent.com/ApeX-Protocol/config/main/${key}.json`
    let response = await fetch(url);
    if (response.status !== 200) {
      throw `${key} =>> ${url} NetWork Error`;
    }
    let value = await response.json();
    fs.writeFileSync(configMap[key], JSON.stringify(value, null, 2));
    console.log(`${configMap[key]} generated successfully`);
  }
}

init().catch(e => console.error(e));