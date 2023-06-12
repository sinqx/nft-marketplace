import React from "react";

import "./modal.css";

const Modal = ({ setShowModal }) => {
  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i className="ri-close-line" onClick={() => setShowModal(false)}></i>
        </span>
        <h6 className="text-center text-light"> Новая ставка </h6>
        <p className="text-center text-light">
          Ваша ставка должна быть выше <span className="money">5.89 ETH</span>
        </p>

        <div className="input__item mb-4">
          <input type="number" placeholder="00 : 00 ETH" />
        </div>

        {/* <div className="input__item mb-3">
          <h6> количество </h6>
          <input type="number" placeholder="Enter quantity" />
        </div> */}

        {/* <div className=" d-flex align-items-center justify-content-between">
          <p>Минимальная ставка </p>
          <span className="money">5.89 ETH</span>
        </div> */}

        <div className=" d-flex align-items-center justify-content-between">
          <p> Комиссия </p>
          <span className="money">0.009 ETH</span>
        </div>

        <div className=" d-flex align-items-center justify-content-between">
          <p> Общая сумма </p>
          <span className="money">5.899 ETH</span>
        </div>

        <button className="place__bid-btn"> Сделать ставку</button>
      </div>
    </div>
  );
};

export default Modal;
