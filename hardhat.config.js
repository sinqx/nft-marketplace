require("@nomiclabs/hardhat-waffle")
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-web3")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-contract-sizer")
require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || "Приватный ключ метамаска"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/<ключ гоерли>"
module.exports = {
    defaultNetwork: "ganache",
    networks: {
        hardhat: {
            chainId: 1337,
            allowUnlimitedContractSize: true,
        },
        ganache: {
            url: "http://127.0.0.1:7545", // адрес для запуска локальной сети Ganache
            chainId: 1337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [`0x${PRIVATE_KEY}`], 
            saveDeployments: true,
            chainId: 5,
            blockConfirmations: 6,
            gasLimit: 40000000,
            allowUnlimitedContractSize: true,
        },
    },
    paths: {
        sources: './contracts',
        artifacts: './src/artifacts',
    },
    contractSizer: {
        runOnCompile: true,
        only: ["Auction"],
    },
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1500,
            },

        },
    },
    mocha: {
        timeout: 40000, // 200 seconds max for running tests
    },
}