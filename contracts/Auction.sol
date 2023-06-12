    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    import "@openzeppelin/contracts/utils/Counters.sol";

    contract Auction {
        using Counters for Counters.Counter;

        receive() external payable {}

        fallback() external payable {}

        event Burn(address nftOwner, uint32 nftId);
        event Transfer(address from, address to, uint32 nftId);
        event SetMinimalBid(uint256 newMinBid, uint32 auctionId);
        event CreateNFT(address nftCreator, string imageHash, string imageName);
        event CreateAuction(
            address creator,
            uint256 startedPrice,
            uint32 auctionId,
            uint32 nftId
        );
        event NewBid(
            uint32 auctionId,
            uint32 nftId,
            address bidder,
            uint256 amount
        );
        event EndAuction(
            address seller,
            address buyer,
            uint256 finalPrice,
            uint32 auctionId,
            uint32 nftId
        );

        Counters.Counter private nftCounter;
        Counters.Counter private auctionCounter;

        mapping(bytes32 => bool) metadataURIs;
        mapping(uint32 => uint256) highestBid;
        mapping(uint32 => address) highestBidder;
        mapping(uint32 => NFT) nfts;
        mapping(uint32 => AuctionInfo) auctions;
        mapping(uint32 => mapping(address => uint256)) auctionBids;

        struct NFT {
            bool active;
            bytes32 PartOfMetadataURI;
            bytes32 PartOfMetadataURIAndName;
            uint256 cost;
            string description;
            address owner;
        }

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

        function ownerOf(uint32 nftId) public view returns (address) {
            address owner = _ownerOf(nftId);
            require(owner != address(0), "Invalid NFT ID");
            return owner;
        }

        function _ownerOf(uint32 nftId) internal view returns (address) {
            return nfts[nftId].owner;
        }

        function getBalance() public view returns (uint256) {
            return address(this).balance;
        }

        function exists(uint32 nftId) internal view returns (bool) {
            return _ownerOf(nftId) != address(0);
        }

        function isOriginal(string memory _imageHash) internal view returns (bool) {
            bytes32 bytesImageHash;

            assembly {
                bytesImageHash := mload(add(_imageHash, 32))
            }

            return metadataURIs[bytesImageHash];
        }

        function getAuctionTime(uint32 _auctionId)
            external
            view
            returns (
                uint256,
                uint256,
                uint256,
                uint256
            )
        {
            AuctionInfo memory _auction = auctions[_auctionId];
            return (
                _auction.startedTime,
                _auction.endTime,
                _auction.endTime - _auction.startedTime,
                _auction.endTime - block.timestamp
            );
        }

        function isEnded(uint32 _auctionId) public view returns (bool) {
            return auctions[_auctionId].endTime < block.timestamp;
        }

        function getAuctionHighestBid(uint32 _auctionId)
            public
            view
            returns (uint256)
        {
            return highestBid[_auctionId];
        }

        function getAuctionHighestBidder(uint32 _auctionId)
            public
            view
            returns (address)
        {
            return highestBidder[_auctionId];
        }

        // function picName(uint32 _nftId) public view returns (string memory){
        //     bytes32 nameBytes = nfts[_nftId].PartOfImageHashAndName;
        //     bytes memory bytesArray = new bytes(18);
        //     uint8 j = 0;
        //     uint8 i = 14;

        //     while (nameBytes[i] != 0) {
        //         bytesArray[j] = nameBytes[i];
        //         j++;
        //         i++;
        //     }
        //     return string(bytesArray);
        // }

        //  function picHash(uint32 _nftId) public view returns (string memory){
        //     bytes32 hashBytes1 = nfts[_nftId].PartOfImageHash;
        //     bytes32 hashBytes2 = nfts[_nftId].PartOfImageHashAndName;
        //     bytes memory bytesArray = new bytes(46);

        //     uint8 i = 0;
        //     for (i = 0; i < 32; i++) {
        //         bytesArray[i] = hashBytes1[i];
        //     }

        //     uint8 j = 0;
        //     for (i = 32; i < 46; i++) {
        //         bytesArray[i] = hashBytes2[j];
        //         j++;
        //     }

        //     return string(bytesArray);
        // }

        // QmNoSVpvJ3dnMw9cA7PrZhugcwS9rv4LC5ChAqjD1nRo77
        function createNFT(
            string memory _imageHash,
            string memory _title,
            string memory _description,
            uint256 _salesPrice
        ) external noReentrant(msg.sender) {
            // assembly 74194 ---- string 119657 gas
            require(bytes(_title).length != 0, "Invalid NFT name");
            require(bytes(_description).length != 0, "Invalid NFT name");
            require(msg.sender != address(0), "Address 0");
            require(_salesPrice > 0);

            bytes32 imageHashPart1;
            assembly {
                imageHashPart1 := mload(add(_imageHash, 32))
            }
            require(
                !metadataURIs[imageHashPart1],
                "Image hash is not unique. You are trying to upload an existed image"
            );

            bytes32 imageHashPart2;

            string memory concat = string.concat(_imageHash, _title);

            assembly {
                imageHashPart2 := mload(add(add(concat, 46), 18))
            }

            nftCounter.increment();
            nfts[uint32(nftCounter.current())] = NFT(
                false,
                imageHashPart1,
                imageHashPart2,
                _salesPrice,
                _description,
                msg.sender
            );
            metadataURIs[imageHashPart1] = true;

            emit CreateNFT(msg.sender, _imageHash, _title);
        }

        function createAuction(
            uint256 _price,
            uint32 _nftId,
            uint16 _auctionTime
        ) external noReentrant(msg.sender) {
            require(_price > 0, "Minimal price should be greater than 0");

            address creator = msg.sender;
            require(
                creator == ownerOf(_nftId),
                "You are not the owner of this NFT"
            );
            require(!nfts[_nftId].active, "NFT is already in Auction!");

            auctionCounter.increment();
            uint32 auctionId = uint32(auctionCounter.current());

            auctions[auctionId] = AuctionInfo(
                true,
                _nftId,
                block.timestamp + _auctionTime * 60,
                block.timestamp,
                _price,
                creator
            );

            highestBidder[auctionId] = creator;

            emit CreateAuction(creator, _price, auctionId, _nftId);
        }

        function setMinBid(uint32 _auctionId, uint256 _minBid) external {
            require(
                auctions[_auctionId].nftOwner == msg.sender,
                "You are not the owner of this NFT"
            );
            require(auctions[_auctionId].progress, "Auction is not available");
            //    require( auctions[_auctionId].minBid != _minBid);

            auctions[_auctionId].minBid = _minBid;

            emit SetMinimalBid(_minBid, _auctionId);
        }

        function placeBid(uint32 _nftId, uint32 _auctionId) external payable {
            require(
                !isEnded(_auctionId),
                "Auction is already finished or doesn't exists"
            );

            address sender = msg.sender;
            //   require(sender != auctions[_auctionId].nftOwner, "Auction creator can't make bids");

            uint256 amount = msg.value;
            require(
                amount >= highestBid[_auctionId] + auctions[_auctionId].minBid,
                "Your bid is unsufficient"
            );

            // Пользователь отправляет свою  ставку
            (bool newBidSend, ) = address(this).call{value: amount}("");
            require(newBidSend, "error1");

            // предыдущий пользователь с максимальной ставкой получает свои деньги обратно
            (bool previusBidReturn, ) = highestBidder[_auctionId].call{
                value: highestBid[_auctionId]
            }("");
            require(previusBidReturn, "error2");

            highestBid[_auctionId] += amount;
            highestBidder[_auctionId] = sender;
            auctionBids[_auctionId][sender] += amount;

            if (auctions[_auctionId].endTime - block.timestamp < 300) {
                auctions[_auctionId].endTime += 180;
            }

            emit NewBid(_auctionId, _nftId, sender, amount);
        }

        function winnerOrSeller(
            address _sender,
            address _auctionOwner,
            uint32 _auctionId
        ) internal view returns (bool) {
            return _sender == _auctionOwner || _sender == highestBidder[_auctionId];
        }

        function endAuction(uint32 _auctionId) internal noReentrant(msg.sender) {
            AuctionInfo memory _auction = auctions[_auctionId];
            require(_auction.endTime > block.timestamp, "Auction is still running");
            require(_auction.progress, "Auction is not available");
            require(
                winnerOrSeller(msg.sender, _auction.nftOwner, _auctionId),
                "You are not the winner of this NFT"
            );

            (bool sent, ) = _auction.nftOwner.call{value: highestBid[_auctionId]}(
                ""
            );
            require(sent);

            transfer(_auction.nftOwner, highestBidder[_auctionId], _auction.nftId);

            emit Transfer(
                _auction.nftOwner,
                highestBidder[_auctionId],
                _auction.nftId
            );
            emit EndAuction(
                _auction.nftOwner,
                highestBidder[_auctionId],
                highestBid[_auctionId],
                _auctionId,
                _auction.nftId
            );

            delete highestBid[_auctionId];
            delete highestBidder[_auctionId];

            nfts[_auction.nftId].active = false;
            _auction.progress = false;
        }

        function transfer(
            address from,
            address to,
            uint32 nftId
        ) internal virtual {
            require(ownerOf(nftId) == from, "transfer from incorrect owner");
            require(to != address(0), "transfer to the zero address");

            nfts[nftId].owner = to;

            emit Transfer(from, to, nftId);
        }

        function _burn(uint32 nftId) external {
            require(exists(nftId), "Unavailable NFT");
            require(
                nfts[nftId].owner == msg.sender,
                "You are not the owner of this NFT"
            );
            delete metadataURIs[nfts[nftId].PartOfMetadataURI];
            delete nfts[nftId];

            emit Burn(msg.sender, nftId);
        }
    }
