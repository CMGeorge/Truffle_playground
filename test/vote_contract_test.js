// const { assert } = require("console");
const {assert} = require('chai')
const fs = require('fs');

const VoteContractTest = artifacts.require("VoteContract");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("VoteContractTest", function (/* accounts */) {
  let instance;
  let  assertion;
  let rawdata = fs.readFileSync('test/candidates_and_voters.json');
  let candidates_and_voters = JSON.parse(rawdata);
  rawdata = fs.readFileSync('test/candidates.json');
  let candidates = JSON.parse(rawdata);
  rawdata = fs.readFileSync('test/voters.json');
  let votersList = JSON.parse(rawdata);


  console.log("candidates_and_voters = ",candidates_and_voters.length)
  beforeEach(function() {
    // runs before each test in this block
  });
  before( async () => {
    
    instance = await VoteContractTest.deployed();
  });
  it("Add candidate with shorter name than 4 characters", async function () {
    try{
      const assertion = await instance.addCandidate('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"St") //Should error
      // assertion = await instance.addCandidate('0xAcF6434B38ae79D56C1963ED1879bd88135CF2ff',"Valid errir") //Should error

    } catch (error){
      const { error: contractError, reason } = error.data[Object.keys(error.data)[0]];
      assert.strictEqual(reason, "Candidate name should have at least 3 characteres", 
      'Thrown error message was not the expected.');
      return;
      // return false;
    }
    
    // return 
    assert.fail("TEST FAILED"+JSON.stringify(assertion));//assert.isTrue(true);
  });
  it("Add same address again for testing duplicate", async function () {
    
    try{
      const assertion = await instance.addCandidate('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"Still me.. But longer Name") //Should error

    } catch (error){
      const { error: contractError, reason } = error.data[Object.keys(error.data)[0]];
      assert.strictEqual(reason, "Can't add a candidate multiple times", 
      'Thrown error message was not the expected.');
      return ;
    }
    
    // return 
    assert.fail("TEST FAILED"+JSON.stringify(assertion));//assert.isTrue(true);
  });
  it ("Check voters count" , async () => {
    let candidateList = (await instance.getCandidates());
    assert(candidateList.length==1,"There should be only one candidate added (initial one)");
  });
  it ("Add more voters and candidates", async()=>{
    //////////////////////
    for (let i=0; i<candidates_and_voters.length;i++){
      await instance.addVoter(candidates_and_voters[i].address,
        candidates_and_voters[i].name,
        true);
    }
    let candidateList = (await instance.getCandidates());
    assert(candidateList.length==3,"We should have now 3 candidates");
    let voters = await instance.votersCount();
    assert(voters==2,"Invalid number of voters. Should be 2 insead "+voters);
    ///////////////////////
    for (let i=0; i<candidates.length;i++){
      await instance.addCandidate(candidates[i].address,
        candidates[i].name);
    }
     candidateList = (await instance.getCandidates());
      voters = await instance.votersCount();
     assert(candidateList.length==5,"We should have now 3 candidates");

    assert(voters==2,"Invalid number of voters. Should be 2 insead "+voters);
    ///////////////
    for (let i=0; i<votersList.length;i++){
      await instance.addVoter(votersList[i],
        "Annonymous",
        false);
    }
     candidateList = (await instance.getCandidates());
    assert(candidateList.length==5,"We should have now 3 candidates");
     voters = await instance.votersCount();
    assert(voters==7,"Invalid number of voters. Should be 2 insead "+voters);
  });
  it("Checking voting....",async() =>{
    try{
      await instance.applyVote("0x55704ae4BA64a2Ac28DA62C44e79D149B13B5FE2"); 
    }catch (error){
      const { error: contractError, reason } = error.data[Object.keys(error.data)[0]];
      assert.strictEqual(reason, "Candidate does not exists", 
      'Thrown error message was not the expected.');
      return ;
    }
  });
  // it("Add two votres and candidates also", async function () {
    
  //   try{
  //     const assertion = await instance.addCandidate('0xAcF6434B38ae79D56C1963ED1879bd88135CF2ff',"Still me.. But longer Name") //Should error

  //   } catch (error){
  //     const { error: contractError, reason } = error.data[Object.keys(error.data)[0]];
  //     assert.strictEqual(reason, "Can't add a candidate multiple times", 
  //     'Thrown error message was not the expected.');
  //     return ;
  //   }
    
  //   // return 
  //   assert.fail("TEST FAILED"+JSON.stringify(assertion));//assert.isTrue(true);
  // });
  // it("Get winner with equal votes", async function () {
  //   const instance = await VoteContractTest.deployed();
  //   instance.getWinner.call();
  //   return true//assert.isTrue(true);
  // });
  // it("Get winner with different votes", async function () {
  //   const instance = await VoteContractTest.deployed();
  //   instance.getWinner.call();
  //   return true//assert.isTrue(true);
  // });
});

// contract("VoteContractTest",accounts => {
//   it("Add candidate with shorter name than 4 characters", () =>
//     VoteContractTest.deployed()
//       .then(instance => {
//         instance.addCandidat.call('0xe4Fb1131a0cCAc3E3c0E970631805485246A0240',"St")
//       })
//   );
// });
