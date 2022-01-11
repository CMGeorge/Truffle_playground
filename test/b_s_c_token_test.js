const BSCTokenTest = artifacts.require("BSCTokenTest");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("BSCTokenTest", function (/* accounts */) {
  it("should assert true", async function () {
    await BSCTokenTest.deployed();
    return assert.isTrue(true);
  });
});
