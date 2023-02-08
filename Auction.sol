// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Auction { 

    event Withdraw(address indexed reciever, uint256 amount);
    event NewBid(uint256 nftId, address bidder, uint256 amount);
    event FinishAuction(address buyer, address seller, uint256 finalPrice, uint256 nftId);
   
    uint32 private auctionCounter;
    mapping(uint256 => bool) activeNFT;
    mapping(uint32 => uint256) highestBid;
    mapping(uint32 => address) highestBidder;
    mapping(uint32 => AuctionInfo) auctions;
    mapping(address => mapping(uint32 => bool)) NFTsOwner;
    mapping(uint32 => mapping(address => uint256)) bids;
    mapping(uint32 => mapping(string => string)) NFTs;

    struct AuctionInfo {
        bool progress;
        uint32 nftId;
        uint256 endTime;
        uint256 startedTime;
        uint256 minBid;
        address nftOwner;
    }

    mapping(address => bool) internal locked;

    modifier noReentrant(address _address) {
        require(!locked[_address], "No re-entrancy");
        locked[_address] = true;
        _;
        locked[_address] = false;
    }

    function checkContractBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function createAuction(uint256 _price, uint32 _nftId, uint8 _auctionTime) external noReentrant(msg.sender) {
        require(msg.sender != address(0));  
        require(NFTsOwner[msg.sender][_nftId]); 
        require(!activeNFT[_nftId]);    
        require(_price > 0);        

        unchecked { auctionCounter++; }
        auctions[ auctionCounter ] =       ////////////////////
        AuctionInfo (
            true,
            _nftId,
            block.timestamp + _auctionTime,
            block.timestamp,
            _price,
            msg.sender
        );
        activeNFT[_nftId] = true;
    }

    function callBackNFT(uint32 _auctionId) external {
        AuctionInfo memory _auction = auctions[_auctionId];

        require(msg.sender == _auction.nftOwner);
        require(block.timestamp > _auction.endTime);
        require(!_auction.progress);

        NFTsOwner[msg.sender][_auction.nftId] = true;
        delete activeNFT[_auction.nftId];
        delete auctions[_auctionId];
    }

    function setMinBid(uint32 _auctionId, uint256 _minBid) external {
        require(auctions[_auctionId].nftOwner == msg.sender);
        auctions[_auctionId].minBid = _minBid;
    }

    function placeBid(uint32 _nftId, uint32 _auctionId) external payable {   
        AuctionInfo memory _auction = auctions[_auctionId];
        
        require(block.timestamp < _auction.endTime);
        require(msg.sender.balance > highestBid[_auctionId] + _auction.minBid);

        //address(this).transfer(msg.value);
        //payable(address(highestBidder[_auctionId])).transfer(highestBid[_auctionId]);
      
        highestBid[_auctionId] += msg.value;
        highestBidder[_auctionId] = msg.sender;
        bids[_auctionId][msg.sender] += msg.value;

        emit NewBid(_nftId, msg.sender, msg.value);
    }

    function endAuction(uint32 _auctionId) external noReentrant(msg.sender) {
        AuctionInfo memory _auction = auctions[_auctionId];
        require(_auction.nftOwner == msg.sender);
        require(_auction.endTime > block.timestamp);
        require(_auction.progress);
   //     (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        payable(address(_auction.nftOwner)).transfer(highestBid[_auctionId]);
        delete highestBid[_auctionId];
        _auction.progress = false;
        ////////////////////////////////
    }

     function withDraw(uint32 _auctionId) external noReentrant(msg.sender) {  ////////////////////////////
        require(msg.sender != highestBidder[_auctionId]);
        // require(highestBidder[_auctionAddress] != address(0));
        require(bids[_auctionId][msg.sender] > 0);

        payable(msg.sender).transfer(bids[_auctionId][msg.sender]);

        delete bids[_auctionId][msg.sender];
        delete highestBidder[_auctionId];
    }

    function mint(string memory _tokenURI, string memory _name, string memory _symbol) external {





        // require(_symbol.leangth < 6);
        // require(_symbol.leangth > 2);
        // require(_name.leangth < 16);
        // require(_name.leangth > 16);
        
        // nftIds += nftIds;
        // ERC721.price[_tokenId] = _price;
        // _mint(address(this), _tokenId);
        // ERC721._setTokenURI(_tokenId, _tokenURI);
        // return true;
    }

}