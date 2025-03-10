import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (
    <Grid style={{textAlign: "center", backgroundColor: "black", color: "white"}}>
    <Typography style={{fontFamily: "reenie", fontSize: "30px"}}>No Items In Marketplace</Typography>
  </Grid>
  )
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
      <Grid
          style={{
            textAlign: "center",
            backgroundColor: "black",
            color: "white",
          }}
        >
          <Typography style={{ fontFamily: "reenie", fontSize: "30px" }}>
            Items for Sale
          </Typography>
        </Grid>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">

          {
            nfts.map((nft, i) => (
              <Grid key={i} className="border shadow rounded-xl overflow-hidden"
              style ={{padding: "10px"}}>
                <img src={nft.image}/>
                <Grid>
                  <p style={{ height: '40px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '20px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </Grid>
                <Grid>
                  <p className="text-2xl mb-4 font-bold text-black">{nft.price} ETH</p>
                  <button className="w-full text-white font-bold py-2 px-12 rounded"
                  style = {{backgroundColor: "black"}}
                  onClick={() => buyNft(nft)}>Buy</button>
                </Grid>
              </Grid>
            ))
          }
        </div>
      </div>
    </div>
  )
}
