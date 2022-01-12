const { assert } = require("console");

const VoteContractTest = artifacts.require("VoteContract");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("VoteContractTest", function (/* accounts */) {
  it("Add candidate with shorter name than 4 characters", async function () {
    const instance = await VoteContractTest.deployed();
    try{
      instance.addCandidat.call('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"St") //Should error
    } catch {
      console.error("CATCHED");
    }
    return true//assert.isTrue(true);
  });
  it("Add same address again for testing duplicate", async function () {
    const instance = await VoteContractTest.deployed();
    instance.addCandidat.call('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"Still me, but duplicate address") //Should error
    // assert(instance.testFunctionality.call()==true,"Check functionality");
    return true //assert.isTrue(true);
  });
  it("Get winner with equal votes", async function () {
    const instance = await VoteContractTest.deployed();
    instance.getWinner.call();
    return true//assert.isTrue(true);
  });
  it("Get winner with different votes", async function () {
    const instance = await VoteContractTest.deployed();
    instance.getWinner.call();
    return true//assert.isTrue(true);
  });
});

contract("VoteContractTest",accounts => {
  it("Add candidate with shorter name than 4 characters", () =>
    VoteContractTest.deployed()
      .then(instance => {
        instance.addCandidat.call('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"St")
      })
  );
});
