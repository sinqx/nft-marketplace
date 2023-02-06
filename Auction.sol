// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Auction is ERC721{ 

    event Withdraw(address indexed reciever, uint256 amount);
    event NewBid(uint256 nftId, address bidder, uint256 amount);
    event FinishAuction(address buyer, address seller, uint256 finalPrice, uint256 nftId);
   
    
    mapping(uint256 => bool) activeNFT;
    mapping(bytes32 => uint256) highestBid;
    mapping(bytes32 => address) highestBidder;
    mapping(bytes32 => AuctionInfo) auctions;
    mapping(address => mapping(uint32 => bool)) NFTsOwner;
    mapping(bytes32 => mapping(address => uint256)) bids;
    mapping(uint32 => mapping(string => string)) NFTs;

    struct AuctionInfo {
        bool progress;
        uint32 nftId;
        uint256 endTime;
        uint256 startedTime;
        uint256 minBid;
        address nftOwner;
    }

    function checkContractBalance() public view returns(uint256) {
        return address(this).balance;
    }

    // function ownerOf(uint256 nftId) external view returns (address) {
    //     return _owners[tokenId];
    // }

    function createAuction(uint256 _price, uint32 _nftId, uint8 _auctionTime) external {
        require(msg.sender != address(0));
        require(NFTsOwner[msg.sender][_nftId]);
        require(!activeNFT[_nftId]);
        require(_price > 0);
        
        auctions[keccak256(abi.encodePacked(_nftId, block.timestamp))] = 
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

    function callBackNFT(bytes32 _auctionAddress) external {
        AuctionInfo memory _auction = auctions[_auctionAddress];
        require(msg.sender == _auction.nftOwner);
        require(block.timestamp > _auction.endTime);
        require(!_auction.progress);

        NFTsOwner[msg.sender][_auction.nftId] = true;
        delete activeNFT[_auction.nftId];
        delete auctions[_auctionAddress];
    }

    function setMinBid(bytes32 _auctionAddress, uint256 _minBid) external {
        require(auctions[_auctionAddress].nftOwner == msg.sender);
        auctions[_auctionAddress].minBid = _minBid;
    }

    function placeBid(uint _nftId, bytes32 _auctionAddress, uint256 _minBid) external payable {   
        AuctionInfo memory _auction = auctions[_auctionAddress];
        
        require(block.timestamp < _auction.endTime);
        require(msg.value > highestBid[_auctionAddress] + _auction.minBid);

        payable(address(this)).transfer(msg.value);
        payable(address(highestBidder[_auctionAddress])).transfer(highestBid[_auctionAddress]);
      
        highestBid[_auctionAddress] += msg.value;
        highestBidder[_auctionAddress] = msg.sender;
        bids[_auctionAddress][msg.sender] += msg.value;

        emit NewBid(_nftId, msg.sender, msg.value);
    }

    function endAuction(bytes32 _auctionAddress) external {
        AuctionInfo memory _auction = auctions[_auctionAddress];

        require(_auction.endTime > block.timestamp);
        require(_auction.progress);

        payable(address(_auction.nftOwner)).transfer(highestBid[_auctionAddress]);

        _auction.progress = false;
    }

     function withDraw(bytes32 _auctionAddress) external {
        require(msg.sender != highestBidder[_auctionAddress]);
        require(bids[_auctionAddress][msg.sender] > 0);

        payable(msg.sender).transfer(bids[_auctionAddress][msg.sender]);

        delete bids[_auctionAddress][msg.sender];
    }

    function mint(string memory _tokenURI, string memory _name, string memory _symbol) external {
        require(_symbol.leangth < 6);
        require(_symbol.leangth > 2);
        require(_name.leangth < 16);
         require(_name.leangth > 16);

        
        // nftIds += nftIds;
        // ERC721.price[_tokenId] = _price;
        // _mint(address(this), _tokenId);
        // ERC721._setTokenURI(_tokenId, _tokenURI);
        // return true;
    }

}