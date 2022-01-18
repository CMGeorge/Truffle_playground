const Deploy = artifacts.require("VoteContract.sol");
const REEANFTDeploy = artifacts.require("REEATestNFT.sol");
const TESTNFTDeploy = artifacts.require("TestNFT.sol");
const enableModule = {
  deployVote: false,
  deployNFT: true
}
const fs = require('fs');
module.exports = function (deployer) {
    const initialAddress = '0xe4Fb1131a0cCAc3E3c0E970631805485246A0240';
  // deployer.deploy(Deploy,initialAddress,"This is me");
  if (enableModule.deployVote){
  deployer.deploy(Deploy,initialAddress,"This is me");
  }
  if (enableModule.deployNFT){
    deployer.deploy(REEANFTDeploy).then( async ()=>{
      // console.log("Market deployed",REEANFTDeploy.address);
      return REEANFTDeploy.address;
    }).then(async (marketAdress)=>{
      console.log("Start NFT with address ",marketAdress);
      await deployer.deploy(TESTNFTDeploy,marketAdress);
      // TESTNFTDeploy.depoyed();
        console.log("NFT Created at: ",TESTNFTDeploy.address)

        let config = `
        export const nftMarketAddress = ${marketAdress}
        export const nftAddress = ${TESTNFTDeploy.address}
        `
        fs.writeFileSync("pages/config.js",config);
      });
  }
  // REEANFTDeploy.deployed();
  // await deployer.deployed();
  // console.log("Market deployed",REEANFTDeploy.address);
  // deployer.deploy(TESTNFTDeploy);
  // const marketAddress =  deployer.address;
  // console.debug("deployer = ",marketAddress);
  // deployer.deploy(TESTNFTDeploy);

};
