/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity:{
    compilers:[
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.7.6",
      }
    ],
  }


}
