import React, { useState } from "react";
import "./modal.css"; // import stylesheet
import Switch from "react-switch";

const SellNftForm = ({ sellNft, sellNftAuction }) => {
  const [show, setShow] = useState(true); // установите show в true, чтобы окно сразу показывалось
  const [sellPrice, setSellPrice] = useState("");
  const [isAuction, setIsAuction] = useState(false);
  const [auctionEndTime, setAuctionEndTime] = useState("");
  const [auctionStartingPrice, setAuctionStartingPrice] = useState("");

  const handleClose = () => setShow(false);

  const handleToggle = () => {
    setIsAuction(!isAuction);
  };

  const handleSellNft = async (e) => {
    e.preventDefault(); // вызываем preventDefault()
    if (isAuction) {
      const auctionEndTimeInUnix = Math.round(new Date(auctionEndTime).getTime() / 1000);
      await sellNftAuction(auctionStartingPrice, sellPrice, auctionEndTimeInUnix);
    } else {
      await sellNft(sellPrice);
    } 
    handleClose();
  };


  return (
    <>
      {show && (
        <div className="modal__wrapper">
          <div className="single__modal">
            <span className="close__modal" onClick={handleClose}>
              <i className="fa fa-times"> x </i>
            </span>
            <h6 className="title">{isAuction ? "Создание аукциона" : "Прямая продажа"}</h6>
            <br></br>
            <form onSubmit={handleSellNft}>
              <div className="input__item">
                <h6>Цена в wei</h6>
                <input
                  type="number"
                  placeholder="Введите сумму"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                />
              </div>
              <br></br>
              <div className="input__item">
                <Switch
                  onChange={handleToggle}
                  checked={isAuction}
                  onColor="#86d3ff"
                  onHandleColor="#2693e6"
                  handleDiameter={20}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={10}
                  width={28}
                  className="react-switch"
                  id="material-switch"
                />
              </div>
              <br></br>
              {isAuction && (
                <>
                  <div className="input__item">
                    <h6>Время окончание аукциона</h6>
                    <input
                      type="datetime-local"
                      placeholder="Enter auction end time"
                      value={auctionEndTime}
                      onChange={(e) => setAuctionEndTime(e.target.value)}
                    />
                  </div>
                  <div className="input__item">
                    <h6>Начальная цена в wei</h6>
                    <input
                      type="number"
                      placeholder="Введите сумму"
                      value={auctionStartingPrice}
                      onChange={(e) =>
                        setAuctionStartingPrice(e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              <button className="place__bid-btn" type="submit">
                {isAuction ? "Создать аукцион" : "Создать прямую продажу"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SellNftForm;