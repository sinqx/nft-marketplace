require("@nomiclabs/hardhat-waffle")
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-web3")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-contract-sizer")
require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/"
module.exports = {
    defaultNetwork: "goerli", 
    //     hardhat: {
    //         // // If you want to do some forking, uncomment this
    //         // forking: {
    //         //   url: MAINNET_RPC_URL
    //         // }
    //         chainId: 31337,
    //         allowUnlimitedContractSize: true,
    //     },
    //     localhost: {
    //         chainId: 31337,
    //     },
    //      fuji: {
    //             url: RPC_URL,
    //             gasPrice: 225000000000,
    //             chainId: 43113,
    //             accounts: [PRIVATE_KEY],
    //         },
    //     },
    //     // subnet: {
    //     //   url: process.env.NODE_URL,
    //     //   chainId: Number(process.env.CHAIN_ID),
    //     //   gasPrice: 'auto',
    //     //   accounts: [process.env.PRIVATE_KEY],
    //     // },
    //     goerli: {
    //         url: GOERLI_RPC_URL,
    //         accounts: [PRIVATE_KEY],
    //         //   accounts: {
    //         //     mnemonic: MNEMONIC,
    //         //   },
    //         saveDeployments: true,
    //         chainId: 5,
    //         blockConfirmations: 6,
    //     },
    //     mainnet: {
    //         url: MAINNET_RPC_URL,
    //         accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //         //   accounts: {
    //         //     mnemonic: MNEMONIC,
    //         //   },
    //         saveDeployments: true,
    //         chainId: 1,
    //     },
    //     polygon: {
    //         url: POLYGON_MAINNET_RPC_URL,
    //         accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //         saveDeployments: true,
    //         chainId: 137,
    //     },
    // },
    // networks: {
    //     hardhat: {
    //       allowUnlimitedContractSize: true,
    //     mainnet: {
    //         url: "https://eth-goerli.g.alchemy.com/v2/A5tO_yPNWth_qY4bOWfocBZU12fT4P9m",
    //         accounts: "A5tO_yPNWth_qY4bOWfocBZU12fT4P9m" !== undefined ? ["A5tO_yPNWth_qY4bOWfocBZU12fT4P9m"] : [],
    //         //   accounts: {
    //         //     mnemonic: MNEMONIC,
    //         //   },
    //         saveDeployments: true,
    //         chainId: 1,
    //     },
    //     }
    //   },

    networks: {
        hardhat: { },
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
        artifacts: './src/abis',
      },
    contractSizer: {
        runOnCompile: true,
        only: ["Auction"],
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
        ],
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            
        },
    },
    mocha: {
        timeout: 40000, // 200 seconds max for running tests
    },
}
