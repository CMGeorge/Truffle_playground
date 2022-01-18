// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "truffle/console.sol";

contract REEATestNFT is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    address payable owner;

    uint256 listingPrice = 0.00001 ether;

    struct TokenItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    event TokenItemMinted(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    mapping(uint256 => TokenItem) private idToTokenItem;

    constructor() {
        owner = payable(msg.sender);
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function makeMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least one wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _tokenIds.increment();

        uint256 itemId = _tokenIds.current();
        idToTokenItem[itemId] = TokenItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        emit TokenItemMinted(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function createItemSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint price = idToTokenItem[itemId].price;
        uint tokenId = idToTokenItem[itemId].tokenId;

        require( msg.value == price,"Price is not correct");
        //Transfer
        idToTokenItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToTokenItem[itemId].owner = payable(msg.sender);
        idToTokenItem[itemId].sold = true;
        _tokensSold.increment();
        payable(owner).transfer(listingPrice);
    }

    function fetchMarketTokens() public view returns (TokenItem[] memory){
      uint itemCount = _tokenIds.current();
      uint unsoldItemCount = _tokenIds.current() - _tokensSold.current();
      uint currentIndex = 0;
      TokenItem[] memory items = new TokenItem[](unsoldItemCount);
      for (uint i=0; i<itemCount;i++){
        uint currentId = i+1;
        if (idToTokenItem[currentId].owner == address(0)){
          TokenItem storage  currentItem = idToTokenItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex++;
        }
      }
      return items;
    }

    function fetchMyNFTs() public view returns (TokenItem[] memory){
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i=0; i<totalItemCount;i++){
        if ( idToTokenItem[i+1].owner == msg.sender){
          itemCount++;
        }
      }

      TokenItem[]  memory items=  new TokenItem[](itemCount);
      for (uint i=0;i<totalItemCount;i++){
        if (idToTokenItem[i+1].owner == msg.sender){
          uint currentId = idToTokenItem[i+1].itemId;
          TokenItem storage currentItem = idToTokenItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex++;
        }
      }
      return items;
    }

    function fetchItemsCreated() public view returns (TokenItem[] memory){
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i=0; i<totalItemCount;i++){
        if ( idToTokenItem[i+1].seller == msg.sender){
          itemCount++;
        }
      }

      TokenItem[]  memory items=  new TokenItem[](itemCount);
      for (uint i=0;i<totalItemCount;i++){
        if (idToTokenItem[i+1].seller == msg.sender){
          uint currentId = idToTokenItem[i+1].itemId;
          TokenItem storage currentItem = idToTokenItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex++;
        }
      }
      return items;
    }
}
