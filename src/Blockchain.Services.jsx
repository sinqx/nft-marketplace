import Web3 from 'web3'
import { setGlobalState, getGlobalState, setAlert } from '../src/store'
import abi from './artifacts/contracts/Auction.sol/Auction.json'
import contractAddress from './artifacts/auction-address.json'
import { Buffer } from "buffer";

const { ethereum } = window;

const getEthereumContract = async () => {
  try {
    const connectedAccount = getGlobalState('connectedAccount');
    if (!connectedAccount) {
      return getGlobalState('contract');
    }
    const web3 = new Web3(ethereum);
    const networkId = await web3.eth.net.getId();
    const networkData = abi.networks[networkId];
    if (!networkData) {
      throw new Error('Cannot find network data for your network ID');
    }
    const contract = new web3.eth.Contract(abi.abi, contractAddress.address);
    setGlobalState('contract', contract);
    return contract;
  } catch (error) {
    console.error(error);
    setAlert(error.message);
    return null;
  }
};

const connectWallet = async () => {
  try {
    if (!ethereum) {
      throw new Error('Please install MetaMask');
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setGlobalState('connectedAccount', accounts[0].toLowerCase());
    localStorage.setItem('connectedAccount', accounts[0].toLowerCase());
  } catch (error) {
    console.error(error);
    setAlert(error.message);
  }
};

const isWalletConnected = async () => {
  try {
    if (!ethereum) {
      throw new Error('Please install MetaMask');
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (!accounts.length) {
      throw new Error('Please connect to your wallet');
    }
    setGlobalState('connectedAccount', accounts[0].toLowerCase());
    localStorage.setItem('connectedAccount', accounts[0].toLowerCase());
    ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
    ethereum.on('accountsChanged', async () => {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (!accounts.length) {
        throw new Error('Please connect to your wallet');
      }
      setGlobalState('connectedAccount', accounts[0].toLowerCase());
      localStorage.setItem('connectedAccount', accounts[0].toLowerCase());
    });
  } catch (error) {
    console.error(error);
    setAlert(error.message);
  }
};

const mintNFT = async ({ _imageHash, _title, _description, _royaltyFee }) => {
  try {
    const account = getGlobalState('connectedAccount')
    console.log(account);
    const contract = await getEthereumContract()
    await contract.methods.createNFT(_imageHash, _title, _description, _royaltyFee)
      .send({ from: account })

    return true
  } catch (error) {
    reportError(error)
  }
}

const createNftAuction = async ({ _startingPrice, _sellPrice, _nftId, _auctionTime }) => {
  try {
    const account = getGlobalState('connectedAccount')
    console.log(_startingPrice, _sellPrice, _nftId, _auctionTime);
    const contract = await getEthereumContract()
    await contract.methods.createAuction(_startingPrice, _sellPrice, _nftId, _auctionTime)
      .send({ from: account })

    return true
  } catch (error) {
    reportError(error)
  }
}

const createSellNft = async ({ _sellPrice, _nftId }) => {
  try {
    console.log(_sellPrice, _nftId);
    const account = getGlobalState('connectedAccount')
    console.log(_sellPrice, _nftId);
    const contract = await getEthereumContract()
    await contract.methods.createSellNft(_sellPrice, _nftId)
      .send({ from: account })

    return true
  } catch (error) {
    reportError(error)
  }
}

const structuredNfts = (nfts) => {
  console.log(nfts); // Проверить, что `nfts` является массивом объектов `NFT`
  return nfts.map((nft) => {
    const imageHashBytes = new Uint8Array(Buffer.from(nft.PartOfMetadataURI.slice(2), 'hex'));
    const titleBytes = new Uint8Array(Buffer.from(nft.PartOfMetadataURIAndName.slice(2), 'hex'));
    const decoder = new TextDecoder('utf-8');
    const imageHash = decoder.decode(imageHashBytes).slice(0, 32) + decoder.decode(titleBytes).slice(0, 14);
    const title = decoder.decode(titleBytes).slice(14);

    return {
      id: nft.id,
      onAuction: nft.onAuction,
      onSale: nft.onSale,
      imageHash: imageHash,
      title: title,
      description: nft.description,
      owner: nft.owner.toLowerCase(),
      creator: nft.creator.toLowerCase(),
    };
  }).reverse();
};

const getNftById = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')

    const contract = await getEthereumContract()
    const nftInfo = await contract.methods.getNftById(id).call()
    return nftInfo
  } catch (error) {
    reportError(error)
    return [];
  }
}

const getAllNFTs = async () => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')

    const contract = await getEthereumContract()
    const nfts = await contract.methods.getAllNFTs().call()
    return structuredNfts(nfts);
  } catch (error) {
    reportError(error)
    return [];
  }
}

const getActiveNFTs = async () => {
  try {
    if (!ethereum) {
      return null; // возвращаем null, если кошелек не подключен
    }
    const contract = await getEthereumContract()
    const nfts = await contract.methods.getActiveNFTs().call()
    console.log(nfts)
    return structuredNfts(nfts);
  } catch (error) {
    reportError(error)
    return null;
  }
}

const getUserNFTs = async (address) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')

    const contract = await getEthereumContract()
    const nfts = await contract.methods.getNFTsByOwner(address).call()
    console.log(nfts)
    return structuredNfts(nfts);
  } catch (error) {
    reportError(error)
  }
}

const getNFThistory = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')
    const contract = await getEthereumContract()
    const creators = await contract.methods.getNFThistory(id).call()
    console.log(creators)
    return creators;
  } catch (error) {
    reportError(error)
  }
}

const getAllAuctionBids = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')
    const contract = await getEthereumContract()
    const bids = await contract.methods.getAuctionBids(id).call()
    console.log(bids)
    return bids;
  } catch (error) {
    reportError(error)
  }
}

const getTopCreators = async () => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')
    const contract = await getEthereumContract()
    const creators = await contract.methods.getTopCreators().call()
    console.log(creators)
    return creators;
  } catch (error) {
    reportError(error)
  }
}

const getAuctionInfoById = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')
    console.log(id)
    const contract = await getEthereumContract()
    console.log(contract)
    const auction = await contract.methods.getAuctionInfoById(id).call()

    return auction;
  } catch (error) {
    reportError(error)
  }
}

const getSaleInfoById = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask')

    const contract = await getEthereumContract()
    const saleInfo = await contract.methods.getNftSaleInfoById(id).call()

    return saleInfo;
  } catch (error) {
    reportError(error)
  }
}

const getHighestBid = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEthereumContract()
    const highestBid = await contract.methods.getAuctionHighestBid(id).call()

    return highestBid;

  } catch (error) {
    reportError(error)
  }
}

const getAuctionMinBid = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEthereumContract()
    const AuctionMinBid = await contract.methods.getAuctionMinBid(id).call()
    console.log(AuctionMinBid)
    return AuctionMinBid;

  } catch (error) {
    reportError(error)
  }
}

const getNftCount = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEthereumContract()
    const nftCount = await contract.methods.getNFTcount().call()

    return nftCount;

  } catch (error) {
    reportError(error)
  }
}

const buyNFT = async ({ id, cost }) => {
  try {
    const contract = await getEthereumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods
      .buyNft(Number(id))
      .send({ from: buyer, value: Number(cost) })

    return true
  } catch (error) {
    reportError(error)
  }
}

const placeBid = async ({ id, cost }) => {
  try {

    const contract = await getEthereumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods
      .placeBid(Number(id))
      .send({ from: buyer, value: cost })

    return true
  } catch (error) {
    reportError(error)
  }
}

const cancelSellNft = async (id) => {
  try {
    const contract = await getEthereumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods
      .cancelSellNft(Number(id))
      .send({ from: buyer })

    return true
  } catch (error) {
    reportError(error)
  }
}

const cancelAuctionNft = async (id) => {
  try {
    const contract = await getEthereumContract()
    const buyer = getGlobalState('connectedAccount')

    await contract.methods
      .cancelAuction(Number(id))
      .send({ from: buyer })

    return true
  } catch (error) {
    reportError(error)
  }
}

const getHighestBidder = async (id) => {
  try {
    const contract = await getEthereumContract()

    const hBidder = await contract.methods
      .getAuctionHighestBidder(Number(id))

    return hBidder
  } catch (error) {
    reportError(error)
  }
}

const auctionIsEnded = async (id) => {
  try {
    const contract = await getEthereumContract()

    const AuctionisEnded = await contract.methods
      .isEnded(Number(id))

    return AuctionisEnded
  } catch (error) {
    reportError(error)
  }
}

const endNftAuction = async (id) => {
  try {
    const contract = await getEthereumContract()

    await contract.methods
      .claimPrize(Number(id))

    return true
  } catch (error) {
    reportError(error)
  }
}

const reportError = (error) => {
  setAlert(JSON.stringify(error), 'red')
  throw new Error(error)
}

export {
  isWalletConnected,
  connectWallet,
  mintNFT,
  createNftAuction,
  createSellNft,
  buyNFT,
  placeBid,
  getNftById,
  getUserNFTs,
  getActiveNFTs,
  getAllNFTs,
  getTopCreators,
  getNFThistory,
  getNftCount,
  getAuctionInfoById,
  getSaleInfoById,
  getHighestBid,
  getAllAuctionBids,
  getAuctionMinBid,
  cancelSellNft,
  cancelAuctionNft,
  getHighestBidder,
  auctionIsEnded,
  endNftAuction
}
