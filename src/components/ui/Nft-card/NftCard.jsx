import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import "./nft-card.css";

import Modal from "../Modal/Modal";
import defaultAvatar from "../../../assets/images/default-avatar.webp";

const NftCard = (props) => {
  const { title, id, currentBid, imgUrl, creator, timerData } = props.item;
  const location = useLocation();

  const [hours, setHours] = useState(timerData.hours);
  const [minutes, setMinutes] = useState(timerData.minutes);
  const [seconds, setSeconds] = useState(timerData.seconds);

  useEffect(() => {
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + hours);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = endDate.getTime() - now;

      const remainingHours = Math.floor(difference / (60 * 60 * 1000));
      const remainingMinutes = Math.floor(
        (difference % (60 * 60 * 1000)) / (60 * 1000)
      );
      const remainingSeconds = Math.floor((difference % (60 * 1000)) / 1000);

      setHours(remainingHours);
      setMinutes(remainingMinutes);
      setSeconds(remainingSeconds);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="single__nft__card">
      <div className="nft__img">
        <img src={imgUrl} alt="" className="w-100" />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link to={`/market/${id}`}>{title}</Link>
        </h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <img src={defaultAvatar} alt="" className="w-100" />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Автор</h6>
              <p>{creator}</p>
            </div>

            <div>
              <h6> Текущая ставка </h6>
              <p>{currentBid} ETH</p>
            </div>
          </div>
        </div>

        {location.pathname === "/my-nft" ? (
          <div className=" mt-3 d-flex align-items-center justify-content-between">
            <button
              className="bid__btn d-flex align-items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              Продать
            </button>

            <div className="timer">
              Осталось:{" "}
              <span>
                {hours} : {minutes} : {seconds}
              </span>
            </div>
          </div>
        ) : (
          <div className=" mt-3 d-flex align-items-center justify-content-between">
            <button
              className="bid__btn d-flex align-items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <i className="ri-shopping-bag-line"></i> Сделать ставку
            </button>

            {showModal && <Modal setShowModal={setShowModal} />}

            <span className="history__link">
              <Link to="#"> история продаж </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftCard;
