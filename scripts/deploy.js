const { ethers, upgrades } = require("hardhat");

const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await upgrades.deployProxy(Auction, []);
  await auction.deployed();

  console.log("Auction deployed to:", auction.address);

  const utilsDir = __dirname + "/utils";

  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir);
  }

  fs.writeFileSync(
    utilsDir + "/auction-address.json",
    JSON.stringify({ address: auction.address }, undefined, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });