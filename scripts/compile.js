const fs = require('fs');
const { ethers } = require('hardhat');

async function main() {
  const contractName = 'Auction'; // Название контракта
  const Contract = await ethers.getContractFactory(contractName);
  const deployedContract = await Contract.deploy(); // развернуть контракт
  await deployedContract.deployed(); // дождаться, пока контракт развернется
  const abi = Contract.interface.format('json');
  fs.writeFileSync(`${contractName}.abi.json`,JSON.stringify(abi, null, 2));
  console.log(`ABI for ${contractName} saved to ${contractName}.abi.json`);

  // использовать deployedContract.address при необходимости
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});