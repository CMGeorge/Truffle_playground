const Deploy = artifacts.require("VoteContract.sol");

module.exports = function (deployer) {
  deployer.deploy(Deploy);
};
