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
  senderaddress, receiveraddress
} from '../config'

import Sender from '../artifacts/contracts/Send.sol/Sender.json'
// import Receiver from '../artifacts/contracts/Send.sol/Receiver.json'

const useStyles = makeStyles((theme) => ({
  formInputShort: {
    margin: "10px",
    width: "25rem",
  },
  formBox: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    alignItems: "center",
  },
}));

export default function Send() {
  const [formInput, updateFormInput] = useState({ address: '', amount: '' })
  const muiClasses = useStyles();

  async function sendEth() {
    const { address, amount } = formInput

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(senderaddress, Sender.abi, signer)
    const price = ethers.utils.parseUnits(amount.toString(), 'ether')
    const transaction = await contract.send(address, {
      value: price
    })
    await transaction.wait()
  }
  return (
    <Grid >
      <Grid style={{textAlign: "center", backgroundColor: "black", color: "white"}}>
        <Typography style={{fontFamily: "reenie", fontSize: "30px"}}>Send Ethereum</Typography>
      </Grid>
      <Grid className={muiClasses.formBox}>
        <Grid style = {{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Typography>Address:</Typography>
          <TextField
            variant= "outlined"
            placeholder="Public Account #"
            className={muiClasses.formInputShort}
            onChange={e => updateFormInput({ ...formInput, address: e.target.value })}
          />
        </Grid>
        <Grid style = {{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Typography>Amount:</Typography>
          <TextField
            placeholder="In Eth"
            variant= "outlined"
            className={muiClasses.formInputShort}
            onChange={e => updateFormInput({ ...formInput, amount: e.target.value })}
          />
        </Grid>
      <Button
        variant = "contained"
        onClick={sendEth}>
      <h1 style = {{fontFamily: "reenie", fontSize: "20px", fontWeight: "bolder"}}>Click To Send</h1></Button>
    </Grid>
  </Grid>
  )
}
