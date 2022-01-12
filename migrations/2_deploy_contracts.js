const Deploy = artifacts.require("VoteContract.sol");

module.exports = function (deployer) {
    const initialAddress = '0xe4Fb1131a0cCAc3E3c0E970631805485246A0240';
  deployer.deploy(Deploy,initialAddress,"This is me");
};
