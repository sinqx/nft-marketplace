import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import LiveAuction from "../components/ui/Live-auction/LiveAuction";
import "../styles/nft-details.css";
import {
  getNftById, getNFThistory, getSaleInfoById, buyNFT, cancelSellNft,
  placeBid, getAuctionMinBid, getAllAuctionBids, getAuctionInfoById,
  cancelAuctionNft, getHighestBidder, getHighestBid, auctionIsEnded, endNftAuction
} from "../Blockchain.Services"; // импортируем функции для работы с контрактом
import defaultAvatar from "../assets/images/default-avatar.webp";
import { Link } from "react-router-dom";
import { Buffer } from "buffer";
import { useGlobalState } from '../store'
import { formatEther } from "@ethersproject/units";
import { truncate } from '../store'

const NftDetails = () => {
  const { id } = useParams();
  const [nft, setNft] = useState({});
  const [nftOwner, setNftOwner] = useState({});
  const [minBid, setMinBid] = useState({});
  const [EndedOrNot, setEndedOrNot] = useState({});
  const [nftSaleInfo, setNftSaleInfo] = useState({});
  const [auctionInfo, setAuctionInfo] = useState({});
  const [history, setHistory] = useState([]);
  const [bids, setBids] = useState([]);
  const [highestBidder, setHighestBidder] = useState([]);
  const [isBidsVisible, setIsBidsVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [connectedAccount] = useGlobalState('connectedAccount')

  const [currentPrice, setCurrentPrice] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [seconds, setSeconds] = useState(null);

  const imageHashBytes = nft.PartOfMetadataURI ?
    new Uint8Array(Buffer.from(nft.PartOfMetadataURI.slice(2), 'hex')) : new Uint8Array();
  const titleBytes = nft.PartOfMetadataURIAndName ?
    new Uint8Array(Buffer.from(nft.PartOfMetadataURIAndName.slice(2), 'hex')) : new Uint8Array();
  const decoder = new TextDecoder('utf-8');
  const imageHash = decoder.decode(imageHashBytes).slice(0, 32) + decoder.decode(titleBytes).slice(0, 14);
  const title = decoder.decode(titleBytes).slice(14);
  const imgUrl = `https://ipfs.io/ipfs/${imageHash}`;

  useEffect(() => {
    const fetchNft = async () => {
      const nftData = await getNftById(id);
      console.log(nftData.owner)
      setNft(nftData);
      setNftOwner(nftData.owner.toLowerCase())
    };
    fetchNft();

    const getMinBid = async () => {
      const minBid = await getAuctionMinBid(id);
      setMinBid(minBid);
    };
    getMinBid();

    const AuctionIsEnded = async () => {
      const EndOrNot = await auctionIsEnded(id);
      setEndedOrNot(EndOrNot);
    };
    AuctionIsEnded();

    const getAuctionHighestBidder = async () => {
      const highestBidder = await getHighestBidder(id);
      setHighestBidder(highestBidder);
    };
    getAuctionHighestBidder();

    const fetchAuctionBids = async () => {
      const bids = await getAllAuctionBids(id);
      if (bids) {
        setBids(bids);
      }
      console.log(bids.time)
    };
    fetchAuctionBids();


    const fetchNftHistory = async () => {
      const historyData = await getNFThistory(id);
      if (historyData) {
        setHistory(historyData);
      }
      console.log(historyData.time)
    };
    fetchNftHistory();


    const getSale = async () => {
      const saleInfo = await getSaleInfoById(id);
      setNftSaleInfo(saleInfo)
      setCurrentPrice(formatEther(saleInfo.price));
      console.log(saleInfo.price)
    };
    getSale();

    const getAuction = async () => {
      const auctionInfo = await getAuctionInfoById(id);
      setAuctionInfo(auctionInfo)
      console.log(auctionInfo)
      setCurrentPrice(formatEther(auctionInfo.salePrice));
      //      console.log(auctionInfo.salePrice)
      setHours(null);
      setMinutes(null);
      setSeconds(null);
    };
    getAuction();
  }, [id]);

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const toggleBids = () => {
    setIsBidsVisible(!isBidsVisible);
  };

  const handleBidInputChange = (e) => {
    setBidAmount(e.target.value);
  };

  const handleBidSubmit = async () => {
    try {
      const success = await placeBid({ id, cost: bidAmount })
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.log('Error placing bid: ', error)
    }
  };

  const handleEndAuctionClick = async () => {
    try {
      const success = await endNftAuction(id)
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.log('Error placing bid: ', error)
    }
  };

  const handleSellClick = async () => {
    // отправка информации о продаже на сервер
  };

  const handleCancelSellClick = async () => {
    try {
      await cancelSellNft(id)
    } catch (error) {
      console.log('Error transfering NFT: ', error)
    }
  };

  const handleCancelAuctionClick = async () => {
    try {
      await cancelAuctionNft(id)
    } catch (error) {
      console.log('Error transfering NFT: ', error)
    }
  };

  const handleBuyClick = async () => {
    try {
      await buyNFT({ id, cost: nftSaleInfo.price })
    } catch (error) {
      console.log('Error transfering NFT: ', error)
    }
  };

  return (
    <>
      <CommonSection title={"NFT №" + nft.id} />

      <section>
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              <img
                src={imgUrl}
                alt={title}
                className="w-100 single__nft-img"
              />
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="single__nft__content">
                <h2>{title}</h2>

                <div className=" d-flex align-items-center justify-content-between mt-4 mb-4">
                  <div className=" d-flex align-items-center gap-4 single__nft-seen">
                    <span>
                      <i className="ri-eye-line"></i> 234
                    </span>
                    <span>
                      <i className="ri-heart-line"></i> 123
                    </span>
                    <span>
                      <i className="ri-percent-line"></i> {nft.royaltyFee}
                    </span>
                  </div>
                </div>

                <div className="nft__creator d-flex gap-3 align-items-center">
                  <div className="creator__img">
                    <img src={defaultAvatar} alt="" className="w-100" />
                  </div>

                  <div className="creator__detail">
                    <p>Автор</p>
                    <Link to={`/user/${nft.owner}`}>
                      <h6>{nft.owner}</h6>
                    </Link>
                  </div>
                </div>

                <p className="my-2">Описание: <br></br>{nft.description}</p>
                <br></br>
                {connectedAccount === nftOwner && !nft.onSale && !nft.onAuction && (
                  <button className="singleNft-btn d-flex align-items-center gap-2 w-100 mb-4" onClick={handleSellClick}>
                    <i className="ri-shopping-bag-line"></i>
                    Продать
                  </button>
                )}

                {connectedAccount !== nftOwner && nft.onSale && (
                  <button className="singleNft-btn d-flex align-items-center gap-2 w-100 mb-4" onClick={handleBuyClick}>
                    <i className="ri-shopping-bag-line"></i>
                    <a> Купить за {currentPrice} eth</a>
                  </button>
                )}

                {connectedAccount == nftOwner && nft.onSale && (
                  <button className="singleNft-btn-cancel d-flex align-items-center gap-2 w-100 mb-4" onClick={handleCancelSellClick}>
                    <i className="ri-shopping-bag-line"></i>
                    <a> Отменить продажу </a>
                  </button>
                )}

                {nft.onAuction && connectedAccount !== nftOwner && EndedOrNot &&(
                  <>
                    <div className="input-group mb-4">
                      <input type="text" className="form-control" placeholder={`Минимальная ставка: ${minBid}`} aria-describedby="button-addon2" value={bidAmount} onChange={handleBidInputChange} />
                      <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleBidSubmit}>Сделать ставку</button>
                    </div>  
                    <div className="creator__detail">
                      <h4 > Или купите сразу :</h4>
                      <br></br>
                    </div>
                    <button className="singleNft-btn d-flex align-items-center gap-2 w-100 mb-4" onClick={handleBuyClick}>
                      <i className="ri-shopping-bag-line"></i>
                      <a> Купить за {currentPrice} eth</a>
                    </button>
                  </>
                )}

                {nft.onAuction && connectedAccount == nftOwner && (
                  <button className="singleNft-btn-cancel d-flex align-items-center gap-2 w-100 mb-4" onClick={handleCancelAuctionClick}>
                    <i className="ri-shopping-bag-line"></i>
                    <a> Отменить аукцион </a>
                  </button>
                )}

                {(nft.onAuction && !EndedOrNot) <  connectedAccount == nftOwner || connectedAccount == highestBidder  && (
                  <button className="singleNft-btn-cancel d-flex align-items-center gap-2 w-100 mb-4" onClick={handleEndAuctionClick}>
                    <i className="ri-shopping-bag-line"></i>
                    <a> Закончить аукцион </a>
                  </button>
                )}

                {nft.onAuction && (
                  <>
                    <div className="history__header d-flex align-items-center justify-content-between">
                      <h3 onClick={toggleBids}> Все ставки</h3>
                      <i
                        className={`ri-arrow-${isHistoryVisible ? "up-line" : "down-line"
                          }`}
                        onClick={toggleBids}
                      ></i>
                    </div>
                    {isBidsVisible && (
                      <div className="history__list">
                        {bids && bids.length > 0 ? (
                          bids.map((item, index) => (
                            <div key={index} className="history__item">
                              {truncate(item.bidder, 6, 6, 15)}{"  "} --- {" "}
                              {formatEther(item.amount)} eth ---{"  "}
                              {item.time && new Date(item.time * 1000).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                hour: 'numeric',
                                minute: 'numeric'
                              })}
                            </div>
                          ))
                        ) : (
                          <div className="no-history">Ставок ещё нет</div>
                        )}
                      </div>
                    )}
                  </>
                )}



                <div className="history__header d-flex align-items-center justify-content-between">
                  <h3 onClick={toggleHistory}>История продаж</h3>
                  <i
                    className={`ri-arrow-${isHistoryVisible ? "up-line" : "down-line"
                      }`}
                    onClick={toggleHistory}
                  ></i>
                </div>
                {isHistoryVisible && (
                  <div className="history__list">
                    {history && history.length > 0 ? (
                      history.map((item, index) => (
                        <div key={index} className="history__item">
                          {truncate(item.boughtBy, 6, 6, 15)}{"  "} --- {" "}
                          {formatEther(item.sellPrice)} eth ---{"  "}
                          {item.time && new Date(item.time * 1000).toLocaleDateString(undefined,
                            { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      ))
                    ) : (
                      <div className="no-history">История продаж пуста</div>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <LiveAuction />
    </>
  );
};

export default NftDetails;