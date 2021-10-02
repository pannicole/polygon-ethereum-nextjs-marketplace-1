import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'

//Web3/Ethereum provider solution for all wallets
import Web3Modal from 'web3modal'
import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";

//create instance of the HTTP API client
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

const useStyles = makeStyles((theme) => ({
  formInputShort: {
    margin: "10px",
    width: "25rem",
  },
  formInputLong: {
    margin: "10px",
    width: "25rem"
  },
  formBox: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    alignItems: "center",
  },
  fileChooser: {
    margin: "10px",
    width: "25rem",
  }
}));

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()
  const muiClasses = useStyles();

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <Grid >
      <Grid style={{textAlign: "center", backgroundColor: "black", color: "white"}}>
        <Typography style={{fontFamily: "reenie", fontSize: "30px"}}>Upload Your Digital Asset</Typography>
      </Grid>
      <Grid className={muiClasses.formBox}>
        <TextField
          variant= "outlined"
          placeholder="Asset Name"
          className={muiClasses.formInputShort}
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <TextField
          placeholder="Asset Description"
          variant= "outlined"
          multiline
          rows={4}
          className={muiClasses.formInputLong}
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <TextField
          placeholder="Asset Price in Eth"
          variant= "outlined"
          className={muiClasses.formInputShort}
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <TextField
          type="file"
          name="Asset"
          className={muiClasses.fileChooser}
          onChange={onChange}
          InputProps={{ disableUnderline: true }}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <br/>
        <Button onClick={createMarket}
          variant = "contained">
          <h1 style = {{fontFamily: "reenie", fontSize: "20px", fontWeight: "bolder"}}>Create Digital Asset</h1>
        </Button>
      </Grid>
    </Grid>
  )
}
