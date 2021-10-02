const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const Sender = await hre.ethers.getContractFactory("Sender");
  const sender = await Sender.deploy();
  await sender.deployed();
  console.log("sender deployed to:", sender.address);

  const Receiver = await hre.ethers.getContractFactory("Receiver");
  const receiver = await Receiver.deploy();
  await receiver.deployed();
  console.log("receiver deployed to:", receiver.address);

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const senderaddress = "${sender.address}"
  export const receiveraddress = "${receiver.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
