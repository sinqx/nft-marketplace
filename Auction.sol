// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract Auction { 

    using Counters for Counters.Counter;

    receive() external payable {}
    
    fallback() external payable {}

    event Transfer(address from, address to, uint64 tokenId);
    event SetMinimalBid(uint256 newMinBid, uint32 auctionId);
    event CreateNFT(address nftCreator, string imageHash, string imageName);
    event CreateAuction(address creator, uint256 startedPrice, uint32 nftId);
    event NewBid(uint32 auctionId, uint32 nftId, address bidder, uint256 amount);
    event EndAuction(address seller, address buyer, uint256 finalPrice, uint32 auctionId, uint32 nftId);

    Counters.Counter private nftCounter;
    
    Counters.Counter private auctionCounter;
    
    mapping(address => bool) internal locked;
    mapping(uint32 => uint256) highestBid;
    mapping(uint32 => address) highestBidder;
    mapping(uint32 => bool) activeNFT;
    mapping(uint32 => address) nftOwner;
    mapping(uint256 => NFT) nfts;
    mapping(uint256 => AuctionInfo) auctions;
    mapping(uint32 => mapping(address => uint256)) auctinsBids;

    struct NFT {
        bytes16 name;
        bytes32 imageHash;
    }

    struct AuctionInfo {
        bool progress;
        uint32 nftId;
        uint256 endTime;
        uint256 startedTime;
        uint256 minBid;
        address nftOwner;
    }

    modifier noReentrant(address _address) {
        require(!locked[_address], "No re-entrancy");

        locked[_address] = true;
        _;
        locked[_address] = false;
    }

    function ownerOf(uint32 nftId) public view virtual returns (address) { ///////////////////////??????????
        address owner = _ownerOf(nftId);
        require(owner != address(0), "Invalid NFT ID");
        return owner;
    }

    function _ownerOf(uint32 nftId) internal view virtual returns (address) {
        return nftOwner[nftId];
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function _exists(uint32 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function picName(uint32 _nftId) public view returns(string memory){
        bytes16 nameBytes = nfts[_nftId].name;
        uint8 i = 0;
        while(i < 16 && nameBytes[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < bytesArray.length; i++) {
            bytesArray[i] = nameBytes[i];
        }
        return string(bytesArray);
    }

     function picHash(uint32 _nftId) public view returns(string memory){
        bytes32 hashBytes = nfts[_nftId].imageHash;
        uint8 i = 0;
        while(i < 32 && hashBytes[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < bytesArray.length; i++) {
            bytesArray[i] = hashBytes[i];
        }
        return string(bytesArray);
    }

     function transfer(address from, address to, uint32 nftId) internal virtual {
        require(ownerOf(nftId) == from, "transfer from incorrect owner");
        require(to != address(0), "transfer to the zero address");

        nftOwner[nftId] = to;

        emit Transfer(from, to, nftId);
    }

    function createNFT(string memory _imageHash, string memory _name) external noReentrant(msg.sender) {  // assembly 74194 ---- string 119657 gas
        require(bytes(_name).length != 0, "Invalid NFT name");
        require(bytes(_imageHash).length == 46, "Invalid IPFS image hash");
        require(msg.sender != address(0), "Address 0");

        nftCounter.increment();
    
        bytes16 bytesName;
        bytes32 bytesImageHash;

        assembly {
            bytesName := mload(add(_name, 16))
            bytesImageHash := mload(add(_imageHash, 32))
        }

        nfts[nftCounter.current()] = NFT(bytesName, bytesImageHash);
        nftOwner[uint32(nftCounter.current())] = msg.sender;
        activeNFT[uint32(nftCounter.current())] = false;

        emit CreateNFT(msg.sender, _imageHash, _name);
    }

    function createAuction(uint256 _price, uint32 _nftId, uint8 _auctionTime) external noReentrant(msg.sender) {
        address creator = msg.sender;

        require(creator != address(0), "Address 0");  
        require(creator == nftOwner[_nftId], "You are not the owner of this NFT");    
        require(_price > 0, "Minimal price should be greater than 0");     

        auctionCounter.increment();

        auctions[ auctionCounter.current() ] =  
        AuctionInfo (
            true,
            _nftId,
            block.timestamp + _auctionTime,
            block.timestamp,
            _price,
            creator
        );

        highestBidder[uint32(auctionCounter.current())] = creator;

        emit CreateAuction(creator, _price, _nftId);
    }

    function setMinBid(uint32 _auctionId, uint256 _minBid) external {
        require(auctions[_auctionId].nftOwner == msg.sender, "You are not the owner of this NFT");
        require(auctions[_auctionId].progress, "Auction is not available");
        auctions[_auctionId].minBid = _minBid;

        emit SetMinimalBid(_minBid, _auctionId);
    }



// gas	59110 gas
// transaction cost	51400 gas 
// execution cost	30056 gas 
    function placeBid(uint32 _nftId, uint32 _auctionId) external payable{
        address sender = msg.sender;

        AuctionInfo memory _auction = auctions[_auctionId];

        require(block.timestamp < _auction.endTime, "Auction is already finished");
        require(sender != _auction.nftOwner, "Auction creator can't bake bids");

        uint256 amount = msg.value;
        require(amount >= highestBid[_auctionId] + _auction.minBid, "Your balance is unsufficient"); 

        // Пользователь отправляет свою  ставку
        (bool newBidSend, ) = address(this).call{value: amount}("");
        require(newBidSend, "error1");
       
        // предыдущий пользователь с максимальной ставкой получает свои деньги обратно
        (bool previusBidReturn, ) = highestBidder[_auctionId].call{value: highestBid[_auctionId]}("");
        require(previusBidReturn, "error2");

        highestBid[_auctionId] += amount;
        highestBidder[_auctionId] = sender;
        auctinsBids[_auctionId][sender] += amount;
        
        if(_auction.endTime - block.timestamp < 6000){
            _auction.endTime += 3000;
        }

        emit NewBid(_auctionId, _nftId, sender, amount);
    }

     function endAuction(uint32 _auctionId) external noReentrant(msg.sender) {
        AuctionInfo memory _auction = auctions[_auctionId];
        require(_auction.nftOwner == msg.sender, "You are not the owner of this NFT");
        require(_auction.endTime > block.timestamp, "Auction is still running");
        require(_auction.progress, "Auction is not available");
        (bool sent,) = _auction.nftOwner.call{value: highestBid[_auctionId]}("");
        require(sent);

        transfer(_auction.nftOwner, highestBidder[_auctionId], _auction.nftId);

        emit EndAuction(_auction.nftOwner, highestBidder[_auctionId], highestBid[_auctionId], _auctionId, _auction.nftId);

        delete highestBid[_auctionId];
        delete highestBidder[_auctionId];
        _auction.progress = false;
    }







    









     function testt() public{

        nfts[1] = NFT("test","fgsdfgds");

        auctions[1] =  AuctionInfo (
            true,
            1,
            block.timestamp + 600000,
            block.timestamp,
            1,
            address(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB)
        );

        highestBid[1] = 100;
        highestBidder[1] = address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);
    }

}