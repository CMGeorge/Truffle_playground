// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Base.sol";
// import "@github.com/openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "@github.com/openzeppelin-solidity/contracts/math/SafeMath.sol";
interface VoteInterface {
    //ERRORS
    error VotingIsNotPublic();

    //EVENTS
    event VoterAdded(uint256 index);
    event CandidateAdded(uint256 index);
    event VoteAssigend();
    event VoteNotConluded();
    event HaveWinner(address);
    //STRUCTURES
    struct Voter {
        string name;
        address delegate;
        bool voted; //usefull only single votes
        address[] votedFor; //usefull for multiple votes
        bool enabled;
    }
    struct Candidate {
        string name;
        address delegate;
        uint256 votes;
        address[] votedForMe;
    }
    enum VotingState{
      VottingNotStarted,
      VottingInProgress,
      VottingSuspended,
      VottingEnded
    }
    function addVoter(
        address id,
        string memory name,
        bool isCandidat
    ) external;
    function addCandidate(address candidatContract, string memory name) external;
    
    function removeCandidate(address candidateAddress) external;

    function applyVote(address to) external;

    function getWinner()
        external
        view
        returns (address winnerAddress, string memory winnerName);

    // function startVoting()
    function endVoting() external;

    function getCandidates()
        external
        view
        returns (Candidate[] memory);
    function votersCount() external view returns (uint);
    // function resetVotes() external;
    // function removeAllCandidates() external;
    // function removeCandidate(address candidateAddress)external;
    // function removeVoter(address voterAddress) external;
}

abstract contract Vote is Base, VoteInterface {
    /// Allow a person to give a vote to multiple persons
    bool multipleVotes;
    bool publicVotes;
    bool running;
    bool anyoneCanPropose;
    uint internal allVotersCount = 0;
    int256 maxVotes;
    

    //MAPPINGS
    mapping(address => Voter) voters;
    mapping(address => Candidate) candidates;

    modifier voteRunning {
        require(running, "Can't do this while vote session is off");
        _;
    }
    modifier voteNotRunning{
        // require(!runing, "Can't remove candidate while vote is running");
        _;
    }
    //i dont know if its a good ideea... but mapping has not iteration, so will use a array
    //this should work best with the mapping. Mapping for quick access, array to iterate on it
    //WARNING: Should define Candate state as "storage" (not memory) and add it on both
    Candidate[] candidateList;

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
        voters[id] = Voter({
            name: name,
            delegate: id,
            voted: false,
            votedFor: emptyAddress,
            enabled: true
        });
        emit VoterAdded(0);
        if (isCandidat) {
            // candidates[id] = Candidate({name: name, delegate: id, votes: 0});
            addCandidate(id, name);
        }
        allVotersCount++;
    }

    // mapping (uint256 => )
    function addCandidate(address candidatContract, string memory name)
        public
        override
        // onlyOwner
        notLocked
    {
        require(
            bytes(name).length > 3,
            "Candidate name should have at least 3 characteres"
        );
        require(
            candidates[candidatContract].delegate == address(0),
            "Can't add a candidate multiple times"
        );
        address[] memory emptyAddress;
        Candidate memory _newCandidate = Candidate({
            name: name,
            delegate: candidatContract,
            votes: 0,
            votedForMe: emptyAddress
        });
        _newCandidate.name = name;
        _newCandidate.delegate = candidatContract;
        _newCandidate.votes = 0;
        _newCandidate.votedForMe = emptyAddress;

        candidates[candidatContract] = _newCandidate; //Candidate({name: name, delegate: candidatContract, votes: 0,votedForMe: emptyAddress});
        candidateList.push(_newCandidate);
        emit CandidateAdded(0);
    }
    function removeCandidate(address candidateAddress) public override onlyOwner voteNotRunning {
        //TODO: Remove it from everywhere...
        //1 Remove form candidates
        delete candidates[candidateAddress];
        //2 Remove from candidatesList
        //3 Remove from voters

    }
    function applyVote(address to) public override {
        /// Only if campain is running
        address from = msg.sender;
        require(
            running == true, 
            "Campaing is not running"
        );
        /// Only if candidate is on the list
        require(
            candidates[to].delegate != address(0),
            "Candidate does not exists"
        );
        /// Only registered voters
        if (!publicVotes) {
            require(
                voters[from].delegate != address(0),
                "Only registered voters can vote."
            );
        }
        // candidates[to]
        if (!multipleVotes) {
            require(
                voters[from].voted == false,
                "Your are not allowed to vote multiple times"
            );
        } else {}
        voters[from].voted = true;
        voters[from].votedFor.push(to);
    }

    function getWinner()
        public
        view
        override
        onlyOwner
        returns (address winnerAddress, string memory winnerName)
    {
        int256 winnerIndex = -1;
        uint256 totalVotes = 0;
        uint256 similarVotes = 0;
        for (uint256 i = 0; i < candidateList.length; i++) {
            Candidate memory _candidate = candidateList[i];
            if (_candidate.votes == totalVotes) {
                similarVotes++;
            } else if (_candidate.votes > totalVotes) {
                winnerIndex = int256(i);
                similarVotes = 1;
                totalVotes = _candidate.votes;
            }
            // if (proposals[p].voteCount > winningVoteCount) {
            //     winningVoteCount = proposals[p].voteCount;
            //     winningProposal_ = p;
            // }
        }
        if (similarVotes == 1) {
            //we have a winner
            winnerAddress = candidateList[uint256(winnerIndex)].delegate;
            winnerName = candidateList[uint256(winnerIndex)].name;
        }
    }

    function endVoting() public override onlyOwner {
        running = false;
    }

    function getCandidates()
        external
        view
        override
        returns (Candidate[] memory)
    {
        return candidateList;
    }
        function votersCount() public override view returns (uint){
            return allVotersCount;
        }

}

contract VoteContract is Base, Vote {
    constructor(address initalCandidate, string memory initialCandidateName) {
        addCandidate(initalCandidate, initialCandidateName);
        running = true;
    }
    function enableAbstention(bool  enabled) public{
      if (enabled){
        addCandidate(address(0xDEAD),"No One");
      }
    }
    function testFunctionality() public pure returns (bool) {
        return true;
    }
}
