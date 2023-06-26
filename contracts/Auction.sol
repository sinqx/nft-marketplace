// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Auction {
    using Counters for Counters.Counter;

    receive() external payable {}

    fallback() external payable {}

    //////////////////////////////////////ИВЕНТЫ/////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

    event Burn(address nftOwner, uint256 nftId);
    event Transfer(address from, address to, uint256 nftId);
    event SetMinimalBid(uint256 newMinBid, uint256 auctionId);

    event CreateSaleNFT(
        uint256 nftId,
        uint256 createdAt,
        uint256 price,
        address nftOwner
    );

    event CreateNFT(
        address nftCreator,
        string imageHash,
        string imageName,
        string description
    );

    event CreateAuction(
        address creator,
        uint256 startedPrice,
        uint256 auctionId,
        uint256 nftId
    );

    event NewBid(
        uint256 auctionId,
        uint256 nftId,
        address bidder,
        uint256 amount
    );

    event EndAuction(
        address seller,
        address buyer,
        uint256 finalPrice,
        uint256 auctionCounter,
        uint256 nftId
    );

    event SellNft(
        address seller,
        address buyer,
        uint256 price,
        uint256 sellCounter,
        uint256 nftId
    );

    //////////МАППИНГИ//////////////////СТРУКТУРЫ/////////////////СЧЁТЧИКИ////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

    Counters.Counter private nftCounter;
    Counters.Counter private auctionCounter;
    Counters.Counter private sellCounter;
    Counters.Counter private transferCounter;

    mapping(bytes32 => bool) metadataURIs;
    mapping(uint256 => uint256) highestBid;
    mapping(uint256 => address) highestBidder;
    mapping(uint256 => NFT) nfts;
    mapping(uint256 => SaleInfo) NftSales;
    mapping(uint256 => NFThistory[]) previousNFTowners;
    mapping(uint256 => AuctionInfo) auctions;
    mapping(uint256 => bids[]) auctionBids;

    struct NFT {
        uint256 id;
        bool onAuction;
        bool onSale;
        uint8 royaltyFee;
        bytes32 PartOfMetadataURI;
        bytes32 PartOfMetadataURIAndName;
        string description;
        address owner;
        address creator;
    }

    struct NFThistory {
        uint256 time;
        uint256 sellPrice;
        address boughtBy;
    }

    struct SaleInfo {
        uint256 price;
        uint256 createdAt;
    }

    struct AuctionInfo {
        bool progress;
        uint256 nftId;
        uint256 endTime;
        uint256 startedTime;
        uint256 minBid;
        uint256 salePrice;
        address nftOwner;
    }

    struct creatorsNFT {
        uint256 countNFT;
        address creator;
    }

    struct bids {
        uint256 amount;
        uint256 time;
        address bidder;
    }

    //////////////////////////////////////ПРОВЕРКИ////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

    mapping(address => bool) internal locked;

    modifier noReentrant(address _address) {
        require(!locked[_address], "No re-entrancy");

        locked[_address] = true;
        _;
        locked[_address] = false;
    }

    function ownerOf(uint256 nftId) public view returns (address) {
        address owner = _ownerOf(nftId);
        require(owner != address(0), "Invalid NFT ID");
        return owner;
    }

    function _ownerOf(uint256 nftId) internal view returns (address) {
        return nfts[nftId].owner;
    }

    function exists(uint256 nftId) internal view returns (bool) {
        return _ownerOf(nftId) != address(0);
    }

    function isOriginal(string memory _imageHash) internal view returns (bool) {
        bytes32 bytesImageHash;

        assembly {
            bytesImageHash := mload(add(_imageHash, 32))
        }

        return metadataURIs[bytesImageHash];
    }

    function isEnded(uint256 _nftId) public view returns (bool) {
        return (auctions[_nftId].endTime < block.timestamp);
    }

    //////////////////////////////////////ГЕТТЕРЫ/////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getAuctionNFTprice(uint256 auctionId)
        public
        view
        returns (uint256)
    {
        return auctions[auctionId].salePrice;
    }

    function getAuctionTime(uint256 _nftId)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        AuctionInfo memory _auction = auctions[_nftId];
        return (
            _auction.startedTime,
            _auction.endTime,
            _auction.endTime - _auction.startedTime,
            _auction.endTime - block.timestamp
        );
    }

    function getAuctionHighestBid(uint256 _nftId)
        public
        view
        returns (uint256)
    {
        return highestBid[_nftId];
    }

    function getAuctionHighestBidder(uint256 _nftId)
        public
        view
        returns (address)
    {
        return highestBidder[_nftId];
    }

    function getNFThistory(uint256 nftId)
        public
        view
        returns (NFThistory[] memory)
    {
        return previousNFTowners[nftId];
    }

    function getAuctionBids(uint256 nftId) public view returns (bids[] memory) {
        return auctionBids[nftId];
    }

    function getNFTcount() external view returns (uint256) {
        return nftCounter.current();
    }

    function getAuctionCount() external view returns (uint256) {
        return auctionCounter.current();
    }

    function getSellCount() external view returns (uint256) {
        return sellCounter.current();
    }

    function getTransferCount() external view returns (uint256) {
        return transferCounter.current();
    }

    function getNftById(uint256 _nftId) external view returns (NFT memory) {
        return nfts[_nftId];
    }

    function getNftSaleInfoById(uint256 _nftId)
        public
        view
        returns (SaleInfo memory)
    {
        return NftSales[_nftId];
    }

    function getNftSalepriceById(uint256 _nftId) public view returns (uint256) {
        return NftSales[_nftId].price;
    }

    function getAuctionInfoById(uint256 _nftId)
        public
        view
        returns (AuctionInfo memory)
    {
        return auctions[_nftId];
    }

    function getAuctionMinBid(uint256 _nftId) public view returns (uint256) {
        return getAuctionHighestBid(_nftId) + auctions[_nftId].minBid;
    }

    function getNFTsByOwner(address owner) public view returns (NFT[] memory) {
        uint256 count = 0;

        // Подсчитываем количество NFT, принадлежащих владельцу
        for (uint256 i = 1; i <= nftCounter.current(); i++) {
            if (nfts[i].owner == owner) {
                count++;
            }
        }

        // Создаем массив NFT, принадлежащих владельцу
        NFT[] memory result = new NFT[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= nftCounter.current(); i++) {
            if (nfts[i].owner == owner) {
                result[index] = nfts[i];
                index++;
            }
        }

        return result;
    }

    function getAuctionNFTs() external view returns (NFT[] memory) {
        uint256 num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if (nfts[i].onAuction) {
                num++;
            }
        }

        NFT[] memory result = new NFT[](num);
        num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if (nfts[i].onAuction) {
                result[num] = nfts[i];
                num++;
            }
        }

        return result;
    }

    function getSaleNFTs() external view returns (NFT[] memory) {
        uint256 num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if (nfts[i].onSale) {
                num++;
            }
        }

        NFT[] memory result = new NFT[](num);
        num = 0;
        for (uint256 i = 1; i <= nftCounter.current(); i++) {
            if (nfts[i].onSale) {
                result[num] = nfts[i];
                num++;
            }
        }

        return result;
    }

    function getAllNFTs() public view returns (NFT[] memory) {
        uint256 num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if (nfts[i].id != 0) {
                num++;
            }
        }

        NFT[] memory result = new NFT[](num);
        num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if (nfts[i].id != 0) {
                result[num] = nfts[i];
                num++;
            }
        }
        return result;
    }

    function getActiveNFTs() public view returns (NFT[] memory) {
        uint256 num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if ((nfts[i].onSale || nfts[i].onAuction) && nfts[i].id != 0) {
                num++;
            }
        }

        NFT[] memory result = new NFT[](num);
        num = 0;
        for (uint256 i = 0; i <= nftCounter.current(); i++) {
            if ((nfts[i].onSale || nfts[i].onAuction) && nfts[i].id != 0) {
                result[num] = nfts[i];
                num++;
            }
        }
        return result;
    }

    function getTopCreators() public view returns (creatorsNFT[] memory) {
        uint256 uniqueCount = 0;
        address[] memory creators = new address[](nftCounter.current());

        // Получаем уникальных создателей NFT
        for (uint256 i = 1; i <= nftCounter.current(); i++) {
            address creator = nfts[i].creator;
            if (creator == address(0)) {
                continue;
            }
            bool creatorExists = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (creators[j] == creator) {
                    creatorExists = true;
                    break;
                }
            }
            if (!creatorExists) {
                creators[uniqueCount] = creator;
                uniqueCount++;
            }
        }

        creatorsNFT[] memory counts = new creatorsNFT[](uniqueCount);
        // Считаем количество NFT, созданных каждым уникальным адресом
        for (uint256 i = 0; i < uniqueCount; i++) {
            address creator = creators[i];
            uint256 count = 0;
            for (uint256 j = 1; j <= nftCounter.current(); j++) {
                if (nfts[j].creator == creator) {
                    count++;
                }
            }
            counts[i].creator = creator;
            counts[i].countNFT = count;
        }

        // Сортируем создателей по убыванию количества NFT
        for (uint256 i = 0; i < uniqueCount - 1; i++) {
            for (uint256 j = 0; j < uniqueCount - i - 1; j++) {
                if (counts[j].countNFT < counts[j + 1].countNFT) {
                    (counts[j], counts[j + 1]) = (counts[j + 1], counts[j]);
                }
            }
        }

        return counts;
    }

    function getNftPicName(uint256 _nftId) public view returns (string memory) {
        bytes32 nameBytes = nfts[_nftId].PartOfMetadataURIAndName;
        bytes memory bytesArray = new bytes(18);
        uint8 j = 0;
        uint8 i = 14;

        while (nameBytes[i] != 0) {
            bytesArray[j] = nameBytes[i];
            j++;
            i++;
        }
        return string(bytesArray);
    }

    function getNftPicHash(uint256 _nftId) public view returns (string memory) {
        bytes32 hashBytes1 = nfts[_nftId].PartOfMetadataURI;
        bytes32 hashBytes2 = nfts[_nftId].PartOfMetadataURIAndName;
        bytes memory bytesArray = new bytes(46);

        uint8 i = 0;
        for (i = 0; i < 32; i++) {
            bytesArray[i] = hashBytes1[i];
        }

        uint8 j = 0;
        for (i = 32; i < 46; i++) {
            bytesArray[i] = hashBytes2[j];
            j++;
        }

        return string(bytesArray);
    }

    //////////////////////////////////////ФУНКЦИИ/////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////

    // QmNoSVpvJ3dnMw9cA7PrZhugcwS9rv4LC5ChAqjD1nRo77
    function createNFT(
        string memory _imageHash,
        string memory _title,
        string memory _description,
        uint8 _royaltyFee
    ) public noReentrant(msg.sender) {
        require(bytes(_imageHash).length == 46, "Invalid NFT image hash");
        require(bytes(_title).length > 0, "Invalid NFT name");
        require(bytes(_description).length > 0, "Invalid NFT description");
        require(msg.sender != address(0), "Address 0");
        require(_royaltyFee <= 20, "maximum fee should be less than 20%");
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
        nfts[nftCounter.current()] = NFT(
            nftCounter.current(),
            false,
            false,
            _royaltyFee,
            imageHashPart1,
            imageHashPart2,
            _description,
            msg.sender,
            msg.sender
        );
        metadataURIs[imageHashPart1] = true;

        emit CreateNFT(msg.sender, _imageHash, _title, _description);
    }

    function createSellNft(uint256 _sellPrice, uint256 _nftId)
        external
        noReentrant(msg.sender)
    {
        require(!nfts[_nftId].onAuction, "NFT is already in Auction!");
        require(!nfts[_nftId].onSale, "NFT is already on Sale!");
        require(_sellPrice > 0, "Minimal price should be greater than 0");
        require(
            msg.sender == ownerOf(_nftId),
            "You are not the owner of this NFT"
        );

        NftSales[_nftId] = SaleInfo(_sellPrice, block.timestamp);

        nfts[_nftId].onSale = true;
        sellCounter.increment();

        emit CreateSaleNFT(_nftId, block.timestamp, _sellPrice, msg.sender);
    }

    function createAuction(
        uint256 _startingPrice,
        uint256 _sellPrice,
        uint256 _nftId,
        uint256 _auctionEndTime
    ) external noReentrant(msg.sender) {
        require(_sellPrice > 0, "Minimal price should be greater than 0");

        address creator = msg.sender;
        require(
            creator == ownerOf(_nftId),
            "You are not the owner of this NFT"
        );
        require(!nfts[_nftId].onAuction, "NFT is already in Auction!");
        require(!nfts[_nftId].onSale, "NFT is already on Sale!");
        require(_startingPrice < _sellPrice, "Start price can't be greate that full sell price");
        auctionCounter.increment();

        auctions[_nftId] = AuctionInfo(
            true,
            _nftId,
            _auctionEndTime,
            block.timestamp,
            _startingPrice,
            _sellPrice,
            creator
        );

        highestBidder[_nftId] = creator;
        nfts[_nftId].onAuction = true;
        emit CreateAuction(creator, _sellPrice, _nftId, _nftId);
    }

    function setMinBid(uint256 _nftId, uint256 _minBid) external {
        require(
            auctions[_nftId].nftOwner == msg.sender,
            "You are not the owner of this NFT"
        );
        require(auctions[_nftId].progress, "Auction is not available");
        require(
            auctions[_nftId].minBid != _minBid,
            "You're trying set the already installed min bid"
        );

        auctions[_nftId].minBid = _minBid;

        emit SetMinimalBid(_minBid, _nftId);
    }

    function buyNft(uint256 _nftId) external payable {
        require(
            msg.value == NftSales[_nftId].price,
            "To buy this NFT without bids, you should pay full price"
        );
        require(msg.sender != nfts[_nftId].owner, "Seller can't buy this NFT");
        require(nfts[_nftId].onSale, "NFT is not selling right now");

        uint256 royalty = (NftSales[_nftId].price * nfts[_nftId].royaltyFee) /
            100;

        if (royalty > 0 && previousNFTowners[_nftId].length > 0) {
            payRoyalties(_nftId, royalty);
        } else if (royalty > 0 && previousNFTowners[_nftId].length == 0) {
            console.log(royalty);
            (bool sentRoyaltyToCreator, ) = nfts[_nftId].owner.call{
                value: royalty
            }("sentRoyaltyToCreator eror");
            require(sentRoyaltyToCreator);
        }

        uint256 sellerAmount = NftSales[_nftId].price - royalty;

        (bool sent, ) = nfts[_nftId].owner.call{value: sellerAmount}(
            "Seller eror"
        );
        require(sent);
        console.log(sellerAmount);

        transfer(nfts[_nftId].owner, msg.sender, _nftId);

        nfts[_nftId].onSale = false;

        emit SellNft(
            nfts[_nftId].owner,
            msg.sender,
            NftSales[_nftId].price,
            sellCounter.current(),
            _nftId
        );
        delete NftSales[_nftId];
    }

    function buyAuctionNft(uint256 _nftId) external payable {
        require(
            !isEnded(_nftId),
            "Auction is already finished or doesn't exists"
        );
        require(
            msg.value == auctions[_nftId].salePrice,
            "To buy thiw NFT without bids, you should pay full price"
        );

        require(
            auctions[_nftId].salePrice > highestBid[_nftId],
            "You can't buy this NFT if bids are already bigger, than sell price"
        );
        require(
            msg.sender != auctions[_nftId].nftOwner,
            "Auction creator can't make bids"
        );

        highestBid[_nftId] += auctions[_nftId].salePrice;
        highestBidder[_nftId] = msg.sender;
        auctionBids[_nftId].push(bids(msg.value, block.timestamp, msg.sender));

        endAuction(_nftId);
    }

    function placeBid(uint256 _nftId) external payable {
        require(
            !isEnded(_nftId),
            "Auction is already finished or doesn't exists"
        );

        address sender = msg.sender;
        require(
            sender != auctions[_nftId].nftOwner,
            "Auction creator can't make bids"
        );

        uint256 amount = msg.value;

        require(
            amount >= highestBid[_nftId] + auctions[_nftId].minBid,
            "Your bid is unsufficient"
        );

        // Пользователь отправляет свою  ставку
        (bool newBidSend, ) = address(this).call{value: amount}("");
        require(newBidSend, "error1");

        // предыдущий пользователь с максимальной ставкой получает свои деньги обратно

        (bool previusBidReturn, ) = highestBidder[_nftId].call{
            value: highestBid[_nftId]
        }("");
        require(previusBidReturn, "error2");

        highestBid[_nftId] = amount;
        highestBidder[_nftId] = sender;
        auctionBids[_nftId].push(bids(msg.value, block.timestamp, msg.sender));

        if (auctions[_nftId].endTime - block.timestamp < 300) {
            auctions[_nftId].endTime += 180;
        }

        emit NewBid(_nftId, _nftId, sender, amount);
    }

    function changeAuctionNftPrice(uint256 _nftId, uint256 _newPrice) external {
        require(ownerOf(_nftId) == msg.sender, "Allowed only for NFT owner");
        require(auctions[_nftId].progress, "Auction is not available");
        require(
            getAuctionHighestBid(_nftId) == 0,
            "You can't change the price of NFT, you somebody already made a bid"
        );
        require(_newPrice > 0, "you can't make NFT free");
        auctions[_nftId].salePrice = _newPrice;
    }

    function cancelAuction(uint256 _nftId) external noReentrant(msg.sender) {
        require(ownerOf(_nftId) == msg.sender, "Allowed only for NFT owner");
        require(nfts[_nftId].onAuction, "Auction is not available");
        require(highestBid[_nftId] == 0, "Auction can't be canceld");

        nfts[_nftId].onAuction = false;
        delete auctions[_nftId];
    }

    function cancelSellNft(uint256 _nftId) external noReentrant(msg.sender) {
        require(ownerOf(_nftId) == msg.sender, "Allowed only for NFT owner");
        require(nfts[_nftId].onSale, "Sale is not available");

        nfts[_nftId].onSale = false;
        delete NftSales[_nftId];
    }

    function claimPrize(uint256 _nftId) public {
        require(auctions[_nftId].nftOwner != msg.sender);
        require(auctions[_nftId].progress, "Auction is not available");
        require(
            auctions[_nftId].endTime > block.timestamp,
            "Auction is still running"
        );

        require(
            winnerOrSeller(msg.sender, auctions[_nftId].nftOwner, _nftId),
            "You are not the winner of this NFT"
        );

        endAuction(_nftId);
    }

    function winnerOrSeller(
        address _sender,
        address _auctionOwner,
        uint256 _nftId
    ) internal view returns (bool) {
        return _sender == _auctionOwner || _sender == highestBidder[_nftId];
    }

    function endAuction(uint256 _nftId) internal noReentrant(msg.sender) {
        AuctionInfo memory _auction = auctions[_nftId];

        require(_auction.progress, "Auction is not available");

        uint256 royalty = (NftSales[_nftId].price * nfts[_nftId].royaltyFee) /
            100;

        if (royalty > 0 && previousNFTowners[_nftId].length > 0) {
            payRoyalties(_nftId, royalty);
        } else if (royalty > 0 && previousNFTowners[_nftId].length == 0) {
            console.log(royalty);
            (bool sentRoyaltyToCreator, ) = nfts[_nftId].owner.call{
                value: royalty
            }("sentRoyaltyToCreator eror");
            require(sentRoyaltyToCreator);
        }

        uint256 sellerAmount = highestBid[_nftId] - royalty;

        (bool sent, ) = nfts[_nftId].owner.call{value: sellerAmount}(
            "Seller eror"
        );
        require(sent);

        transfer(_auction.nftOwner, highestBidder[_nftId], _auction.nftId);

        previousNFTowners[_nftId].push(
            NFThistory(
                block.timestamp,
                highestBid[_nftId],
                highestBidder[_nftId]
            )
        );

        emit Transfer(_auction.nftOwner, highestBidder[_nftId], _auction.nftId);
        emit EndAuction(
            _auction.nftOwner,
            highestBidder[_nftId],
            highestBid[_nftId],
            _nftId,
            _auction.nftId
        );

        delete auctions[_nftId];
        delete highestBid[_nftId];
        delete highestBidder[_nftId];

        nfts[_nftId].onAuction = false;
    }

    function payRoyalties(uint256 nftId, uint256 royalty) internal {
        uint256 numPreviousOwners = previousNFTowners[nftId].length + 1;
        console.log(numPreviousOwners);
        uint256 royaltyPerOwner = royalty / numPreviousOwners;
        console.log(numPreviousOwners);
        for (uint256 i = 0; i < numPreviousOwners - 1; i++) {
            address previousOwner = previousNFTowners[nftId][i].boughtBy;
            console.log(previousOwner);
            (bool sentToPreviousOwner, ) = previousOwner.call{
                value: royaltyPerOwner
            }("Sending to previous Owner error");
            require(sentToPreviousOwner);
        }
        (bool sentToCreator, ) = nfts[nftId].creator.call{
            value: royaltyPerOwner
        }("Sending to creator error");
        require(sentToCreator);
    }

    function transfer(
        address from,
        address to,
        uint256 nftId
    ) internal virtual {
        require(ownerOf(nftId) == from, "transfer from incorrect owner");
        require(to != address(0), "transfer to the zero address");

        uint256 amount = 0;
        if (nfts[nftId].onSale) {
            amount = NftSales[nftId].price;
        } else {
            amount = highestBid[nftId];
        }
        previousNFTowners[nftId].push(NFThistory(block.timestamp, amount, to));

        nfts[nftId].owner = to;
        transferCounter.increment();
        emit Transfer(from, to, nftId);
    }

    function burn(uint256 _nftId) external {
        require(exists(_nftId), "Unavailable NFT");
        require(!nfts[_nftId].onSale, "NFT now is selling");
        require(!nfts[_nftId].onAuction, "NFT now is on Auction");
        require(
            nfts[_nftId].owner == msg.sender,
            "You are not the owner of this NFT"
        );
        delete metadataURIs[nfts[_nftId].PartOfMetadataURI];
        delete nfts[_nftId];

        emit Burn(msg.sender, _nftId);
    }

    function AAtest() public payable {
        (bool sent, ) = address(this).call{value: msg.value}("");
        require(sent);

        bytes32 hash1 = "QmNoSVpvJ3dnMw9cA7PrZhugcwS9rv4L";
        bytes32 hash2 = "C5ChAqjD1nRo77ZERO PATIENT";
        string memory desc = "1 pic kostil";
        nfts[0] = NFT(
            0,
            false,
            false,
            0,
            hash1,
            hash2,
            desc,
            address(this),
            address(this)
        );
    }

    function setAuctionTime(uint256 nftId) public {
        auctions[nftId].endTime += block.timestamp + 100;
    }
}
