const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.deployed();

  console.log("Auction deployed to:", auction.address);
  console.log("Transaction hash:", auction.deployTransaction.hash);

  // Сохранение адреса контракта в файл
  const arifatsDir = path.join(__dirname, "..", "src", "artifacts");
  if (!fs.existsSync(arifatsDir)) {
    fs.mkdirSync(arifatsDir, { recursive: true });
  }

  const auctionArtifactsPath = path.join(arifatsDir, "Auction.json");
  fs.writeFileSync(
    auctionArtifactsPath,
    JSON.stringify(Auction.interface, undefined, 2)
  );

  const auctionAddressPath = path.join(arifatsDir, "auction-address.json");
  fs.writeFileSync(
    auctionAddressPath,
    JSON.stringify({ address: auction.address }, undefined, 2)
  );
  
  // Вывод информации о контракте
  console.log("Contract deployed to:", auction.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });