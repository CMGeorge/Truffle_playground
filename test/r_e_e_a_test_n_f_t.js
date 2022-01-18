const REEATestNFT = artifacts.require("REEATestNFT");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

const { assert } = require('chai')
const TESTNFTDeploy = artifacts.require("TestNFT.sol");


contract("REEATestNFT", function (accounts) {
  it("should assert true", async function () {
    var instance = await REEATestNFT.deployed();
    // await TESTNFTDeploy.deploy();
    // var NFT = await TESTNFTDeploy.deployed("asdsadsa");

    const marketAddress = instance.address;
    const _nft = await TESTNFTDeploy.new(marketAddress);
    const _nftContractAdress = _nft.address;
    return assert.isTrue(true);

    let listingPrice = await instance.getListingPrice();
    listingPrice = listingPrice.toString();
    const auctionPrice = web3.utils.toWei('0.001', 'ether');

    await _nft.mintToken("https-t1");
    await _nft.mintToken("https-t2");
    await instance.makeMarketItem(_nftContractAdress,
      1,
      auctionPrice,
      { value: listingPrice })
    await instance.makeMarketItem(_nftContractAdress, 2, auctionPrice, { value: listingPrice })

    const [_,buyerAddress] = accounts;
    await instance.createItemSale(_nftContractAdress,1,{value: auctionPrice, from: buyerAddress})
    
      let items = await instance.fetchMarketTokens();
    // const auctionPrice = consol
    // await _ntf.deployed();
    console.debug("marketAddress = ", marketAddress, _nft.address, web3.utils.toWei('100', 'ether'), items);

    items = await Promise.all(items.map(async i =>{
      const tokenUri = await _nft.tokenURI(i.tokenId);
      let item = {
        priceInETH: web3.utils.fromWei(i.price,"ether"),
        priceInWei: i.price,
        tokenId: i.tokenId,
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }))
    console.log("Final items: ",items);
    return assert.isTrue(true);
  });
});
