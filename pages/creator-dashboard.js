import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/Market.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return (
      <Grid
      style={{
        textAlign: "center",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <Typography style={{ fontFamily: "reenie", fontSize: "30px" }}>
        No Assets Created
      </Typography>
    </Grid>
    )
  return (
    <Grid>
      {/* <div className="p-4"> */}
        <Grid
          style={{
            textAlign: "center",
            backgroundColor: "black",
            color: "white",
          }}
        >
          <Typography style={{ fontFamily: "reenie", fontSize: "30px" }}>
            Items Created
          </Typography>
        </Grid>
        <div className="p-4">
        {/* <h2 className="text-2xl py-2">Items Created</h2> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <div style={{backgroundColor: "black"}}>
                <p style={{color: "white", margin: "10px", fontSize: "18px"}}>
                  Price - {nft.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      {/* </div> */}
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <Grid
              style={{
                textAlign: "center",
                backgroundColor: "black",
                color: "white",
              }}
            >
              <Typography style={{ fontFamily: "reenie", fontSize: "30px" }}>
                Items Sold
              </Typography>
            </Grid>
            {/* <h2 className="text-2xl py-2">Items sold</h2> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="rounded"/>
                  <div style={{backgroundColor: "black"}}>
                    <p style={{color: "white", margin: "10px", fontSize: "20px"}}>
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Grid>
  );
}
