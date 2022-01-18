// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
//OpenZeppelin NFT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract TestNFT is ERC721URIStorage {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address contractAddress;
  int currentId;
  constructor(address marketplaceAddress) ERC721("REEA","REEA") {
    contractAddress = marketplaceAddress;
  }

  function mintToken(string memory tokenURI) public returns(uint256){
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    setApprovalForAll(contractAddress, true);
    return newItemId;
  }
}
