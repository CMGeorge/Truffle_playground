// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Base {
  //Can't be imutable becaus onlyOwner is called at contract creation when adding first proposal
    // address immutable owner;
    address owner;

    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner{
    require(owner==msg.sender,"Only owner can do this");
    _;
    }
}

abstract contract Vote is Base {

    error VotingIsNotPublic();
    struct Voter {
        string name;
        address delegate;
        bool voted;//usefull only single votes
        address[] votedFor; //usefull for multiple votes
    }
    struct Candidate {
        string name;
        address delegate;
        uint256 votes;
        address[] votedForMe;
    }

    /// Allow a person to give a vote to multiple persons
    bool multipleVotes;
    bool publicVotes;
    bool runing;
    int256 maxVotes;



    mapping(address => Voter) voters;
    mapping(address => Candidate) candidates;
    //i dont know if its a good ideea... but mapping has not iteration, so will use a array
    // Candidates[] candidateList;
    constructor() {
        multipleVotes = false;
        maxVotes = -1;
        publicVotes = false;
    }

    function addVoter(
        address id,
        string memory name,
        bool isCandidat
    ) public {
        address[] memory emptyAddress;
        voters[id] = Voter({name: name, delegate: id, voted: false, votedFor: emptyAddress});
        if (isCandidat) {
            // candidates[id] = Candidate({name: name, delegate: id, votes: 0});
            addCandidat(id, name);
        }
    }

    // mapping (uint256 => )
    function addCandidat(address candidatContract, string memory name) public  onlyOwner{
      require(bytes(name).length>3,
      "Candidate name should have at least 3 characteres");
      require(candidates[candidatContract].delegate==address(0),
      "Can't add a candidate multiple times");      
                 address[] memory emptyAddress;

      candidates[candidatContract] = Candidate({name: name, delegate: candidatContract, votes: 0,votedForMe: emptyAddress});
    }
    
    function applyVote(address from, address to) public {
      /// Only if campain is running
      require(runing==true,"Campaing is not running");
      /// Only if candidate is on the list
      require(candidates[to].delegate!=address(0),
      "Candidate does not exists");
      /// Only registered voters      
        if (!publicVotes){
            require(voters[from].delegate!=address(0),
            "Only registered voters can vote.");
        }
        // candidates[to]
        if (!multipleVotes){
          require(voters[from].voted==false,
          "Your are not allowed to vote multiple times");
        }else{

        }
        voters[from].voted = true;
        voters[from].votedFor.push(for);
    }

    function getWinner() public view onlyOwner returns (address winnerAddress, string memory winnerName){

    }
}

contract VoteContract is Base, Vote {
    constructor(address initalCandidate, 
    string memory initialCandidateName) {
      addCandidat(initalCandidate, initialCandidateName);
    }

}
