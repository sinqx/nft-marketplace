import "./nft-card.css";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SellNftForm from "../Modal/Modal";
import { formatEther } from "@ethersproject/units";
import { truncate } from '../../../store'
import defaultAvatar from "../../../assets/images/default-avatar.webp";
import { getAuctionInfoById, getSaleInfoById, getHighestBid, createNftAuction, createSellNft } from "../../../Blockchain.Services.jsx";

const NftCard = (props) => {
  const { id, onAuction, onSale, title, imageHash, owner } = props.item;
  const location = useLocation();
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const imgUrl = `https://ipfs.io/ipfs/${imageHash}`;

  useEffect(() => {
    if (onSale) {
      // Вызываем функцию getSale() и обновляем состояние компонента с помощью полученных данных
      const getSale = async () => {
        const saleInfo = await getSaleInfoById(id);
        setCurrentPrice(formatEther(saleInfo.price));
        setHours(null);
        setMinutes(null);
        setSeconds(null);
      };

      getSale();
    } else if (onAuction) {
      // Вызываем функцию getAuctionInfoById() и обновляем состояние компонента с помощью полученных данных
      const getAuction = async () => {
        const auctionInfo = await getAuctionInfoById(id);
        console.log(auctionInfo)
        setCurrentPrice(await getHighestBid(id));

        const endTime = new Date(auctionInfo.endTime * 1000);
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = endTime - now;
          if (distance < 0) {
            clearInterval(interval);
            setHours("00");
            setMinutes("00");
            setSeconds("00");
          } else {
            const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
            const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
            const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0");
            setHours(hours);
            setMinutes(minutes);
            setSeconds(seconds);
          }
        }, 1000);
      };

      getAuction();
    } else {
      // Скрываем таймер, если ни одно из значений onSale и onAuction не установлено
      setCurrentPrice(null);
      setHours(null);
      setMinutes(null);
      setSeconds(null);
    }
  }, [onSale, onAuction, id]);

  const [showSellNftModal, setShowSellNftModal] = useState(false);

  const handleSellClick = () => {
    setShowSellNftModal(true);
  }

  const handleSellNft = async (_sellPrice) => {
    try {
      console.log(_sellPrice, id)
      const _nftId = id
      await createSellNft({ _sellPrice, _nftId }); // передаем объект с двумя свойствами
      setShowSellNftModal(false); // закрываем модальное окно после успешной продажи
    } catch (error) {
      console.log("Error selling NFT: ", error);
    }
  };

  const handleSellNftAuction = async (_startingPrice, _sellPrice, auctionTime) => {
    try {
      const _auctionTime = auctionTime;
      const _nftId = id
      console.log(_startingPrice, _sellPrice, _nftId, _auctionTime);
      await createNftAuction({ _startingPrice, _sellPrice, _nftId, _auctionTime });
      setShowSellNftModal(false); // закрываем модальное окно после успешной продажи
    } catch (error) {
      console.log("Error creating NFT auction: ", error);
    }
  }
  return (
    <div className="single__nft__card">
      <div className="nft__img">
        <img src={imgUrl} alt="" className="w-100" />
      </div>

      <div className="nft__content">
        <div className="d-flex justify-content-between">
          <h5 className="nft__title">
            <Link to={`/nft/${id}`}>{title}</Link>
          </h5>
          {onAuction && (
            <div className="auction__info">
              <div className="timer">
                <span>{hours} :</span>
                <span>{minutes} :</span>
                <span>{seconds}</span>
              </div>
             
            </div>
          )}
        </div>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <img src={defaultAvatar} alt="" className="w-100" />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Автор</h6>
              <p>{truncate(owner, 5, 3, 10)}</p>
            </div>

            <div>
              <h6>Цена</h6>
              {currentPrice ? (
                <p>{truncate(currentPrice, 9, 0, 11)} ETH</p>
              ) : (
                <p className="text-muted">Не продается</p>
              )}
            </div>
          </div>
        </div>


        <div className="link">
          {location.pathname === `/user/${owner}` ? (
            <>
              {currentPrice || onAuction ? (
                <Link to={`/nft/${id}`} className="bid__btn link d-flex align-items-center justify-content-center gap-1 w-100">
                  Подробнее
                </Link>
              ) : (
                <button className="bid__btn d-flex align-items-center justify-content-center gap-1 w-100"
                  onClick={handleSellClick}>
                  Продать NFT
                </button>
              )}
            </>
          ) : (
            <Link to={`/nft/${id}`} className="bid__btn link d-flex align-items-center justify-content-center gap-1 w-100">
              Подробнее
            </Link>
          )}
        </div>
      </div>

      {
        showSellNftModal && (
          <SellNftForm
            sellNft={handleSellNft}
            sellNftAuction={handleSellNftAuction}
            onClose={() => setShowSellNftModal(false)}
          />
        )
      }
    </div >
  );
};


export default NftCard;