import { ethers } from 'ethers'
import { useEffect, useState } from 'react';
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftMarketAddress, nftAddress } from "./contract_config.js"


//import artifacts to use contract on page
import NFTMarket from "../build/contracts/REEATestNFT.json"
import NFT from "../build/contracts/TestNFT.json"
export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  let userAddress;
  useEffect(
    () => {
      loadNFTs()
    },
    []
  )

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const metamaskConnection = await web3Modal.connect();
    const metamaskProvider = new ethers.providers.Web3Provider(metamaskConnection);
    const METAMASK_SIGNER = metamaskProvider.getSigner();
    userAddress = await METAMASK_SIGNER.getAddress();

    const provider = new ethers.providers.JsonRpcProvider({url: "http://localhost:7545"});
    // const provider = new ethers.providers.JsonRpcProvider("https://matic-mumbai.chainstacklabs.com");
    console.log("provider = ",provider,(await METAMASK_SIGNER.getAddress()));
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, provider)
    const data = await marketContract.fetchMarketTokens();
    const itmes = await Promise.all(data.map(async i => {
      console.log("Iterate");
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      console.log("tokenUri ",tokenUri);
      let meta 
      try{
        meta = await axios.get(tokenUri);
      }catch(e){
        meta = {data:{}}
        console.error("Cathc error on axios ", e);
      }
      const price = ethers.utils.formatUnits(i.price.toString(), "ether");
      console.log("Load URI ",i.seller)
      // console.log("Compare Addresses "?i.seller!==userAddress)
      // if (meta){
        return {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          allowBuy: i.seller!==userAddress
        }
      // }
    }));
    setNFTs(itmes);
    setLoadingState("loaded");
  }
  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    console.log("Preape to buy for ", price,nft.tokenId);
    const transaction = await contract.createItemSale(nftAddress, nft.tokenId, {
      value: price
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length) return (<h1 className="px-20 text-4x1 py-7">NO NFT found in marketplace</h1>)
  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1024px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg: grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft, i) =>
            (
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <img src={nft.image} />
                <div className='p-4'>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>{nft.name}</p>
                  <div style={{ height: '72px', overflow: 'hidden' }}>
                    <p className='text-gray-400'>{nft.description}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} ETH</p>
                  <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded' onClick={() => buyNFT(nft)} hidden={!nft.allowBuy} text="Buy NFT">Buy NFT</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
