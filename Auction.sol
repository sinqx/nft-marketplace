// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Auction is ERC721{ 

    event NewBid(uint256 nftId, address bidder, uint256 amount);
    event FinishAuction(address buyer, address seller, uint256 finalPrice, uint256 nftId);
    event Withdraw(address indexed reciever, uint256 amount);
    
    mapping(uint256 => bool) activeNFT;
    mapping(address => uint256) balance;
    mapping(bytes32 => uint256) highestBid;
    mapping(bytes32 => address) highestBidder;
    mapping(bytes32 => AuctionInfo) auctions;
    mapping(address => mapping(uint256 => bool)) NFTsOwner;
    mapping(bytes32 => mapping(address => uint256)) bids;

    struct AuctionInfo {
        bool progress;
        uint256 endTime;
        uint256 startedTime;
        uint256 nftId;
        uint256 startedPrice;
        address nftOwner;
    }

    function createAuction(uint256 _price, uint256 _nftId, uint8 _auctionTime) external {
        require(msg.sender != address(0));
        require(NFTsOwner[msg.sender][_nftId]);
        require(!activeNFT[_nftId]);
        require(_price > 0);
        
        auctions[keccak256(abi.encodePacked(_nftId, block.timestamp))] = 
        AuctionInfo (
            true,
            block.timestamp + _auctionTime,
            block.timestamp,
            _nftId,
            _price,
            msg.sender
        );
        activeNFT[_nftId] = true;
    }

    function callBackNFT(bytes32 _auctionAddress) external {
        AuctionInfo memory _auction = auctions[_auctionAddress];
        require(msg.sender == _auction.nftOwner);
        require(block.timestamp > _auction.endTime);
        require(!_auction.progress);

        NFTsOwner[msg.sender][_auction.nftId] = true;
        delete activeNFT[_auction.nftId];
        delete auctions[_auctionAddress];
    }

    function placeBid(uint _nftId, bytes32 _auctionAddress) external payable
    {   
        AuctionInfo memory _auction = auctions[_auctionAddress];
        require(block.timestamp < _auction.endTime);
        require(msg.value > highestBid[_auctionAddress]);
        require(msg.value > balance[msg.sender]);

        unchecked { balance[msg.sender] -= msg.value; }
        highestBid[_auctionAddress] += msg.value;
        highestBidder[_auctionAddress] = msg.sender;
        bids[_auctionAddress][msg.sender] += msg.value;

        emit NewBid(_nftId, msg.sender, msg.value);
    }

   function mint(string memory _tokenURI, uint256 _price)
    public
    returns (bool)
    {
        uint256 _tokenId = totalSupply() + 1;
        ERC721.price[_tokenId] = _price;
        _mint(address(this), _tokenId);
        ERC721._setTokenURI(_tokenId, _tokenURI);
        return true;
    }
    // function endAuction() external returns (bool) {
    //     require(highestBidderAddress != address(0));

    //     endBlock = block.timestamp;
    //     payable(owner).transfer(highestBid);
    //     payable(owner).transfer(nft);
    //     return true;
    // }

}