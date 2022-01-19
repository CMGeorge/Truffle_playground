import { ethers } from 'ethers'
import { useState } from 'react';
import axios from 'axios'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from "ipfs-http-client"
import { nftMarketAddress, nftAddress } from "./contract_config.js"


//import artifacts to use contract on page
import NFTMarket from "../build/contracts/REEATestNFT.json"
import NFT from "../build/contracts/TestNFT.json"
import { useRouter } from 'next/router';


const ipfsAPIURL = "http://localhost:5001/api/v0"
const ipfsURL = "http://localhost:8080/ipfs/"
const client = ipfsHttpClient({url:ipfsAPIURL});
export default function MintItem() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({
        price: "", name: "", description: ""
    });
    const router = useRouter();

    async function uploadImage(e) {
        
        const file = e.target.files[0]
        console.log("On Change Called", file)
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log("received: ${prog}",prog)
                }
            )
            console.log("Added object... ",added);
            const url = ipfsURL+added.path;
            console.debug("Will set URL:",url);
            setFileUrl(url)
        } catch (error) {
            console.log("Error uploading file", error);
        }
    }

    async function createMarket() {
        const { name, description, price } = formInput;
        if (!name || !description || !price || !fileUrl) {
            return false;
        }

        //upload to ipfs
        const data = JSON.stringify({
            name, description, image: fileUrl
        });

        try {
            const added = await client.add(data);
            const url = ipfsURL + added.path;
            createSale(url)
        } catch (error) {
            console.log("Error uploading file", error);
        }
    }

    async function createSale(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner();
        let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait();
        console.log("TX is: ",tx)
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber();
        const price = ethers.utils.parseUnits(formInput.price, "ether");
        contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer);
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();
        console.log("Contract is: ",contract);
        transaction = await contract.makeMarketItem(nftAddress, tokenId,price,{value: listingPrice});
        await transaction.wait();
        router.push("./");
    }
    return (
        <div className='flex justify-center'>
            <div className='w-1/3 flex flex-col pb-12'>
                <input placeholder='Asset Name' className='mt-8 border rounded p-4' onChange={e=>updateFormInput({...formInput,name: e.target.value})}/>
                <textarea placeholder='Asset Descripton' className='mt-2 border rounded p-4' onChange={e=>updateFormInput({...formInput,description: e.target.value})}/>
                <input placeholder='Asset Price (ETH)' className='mt-2 border rounded p-4' onChange={e=>updateFormInput({...formInput,price: e.target.value})}/>
                <input type='file' 
                name='Asset' className='mt-4' onChange={uploadImage}/>
                    
                {
                        fileUrl && (<img className='rounded mt-4' width='350px' src={fileUrl}></img>)
                    }
                <button onClick={createMarket} 
                className='font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg'>Mint NFT</button>

            </div>
        </div>
    );
}