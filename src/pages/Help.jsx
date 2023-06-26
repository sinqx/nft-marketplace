import React from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";

import "../styles/wallet.css";

const wallet__data = [
  {
    title: "Metamask",
    desc: "криптовалютный кошелек-браузерное расширение, который позволяет пользователям взаимодействовать с блокчейнами напрямую через браузер.",
    icon: "ri-money-cny-circle-line",
  },

];

const Wallet = () => {
  return (
    <>
      <CommonSection title="Инструкция" />
      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5 text-center">
              <div className="w-100 m-auto">
                <h3 className="text-light">Начните создавать</h3>
                <p>
                  
                </p>
              </div>
            </Col>

            

            {wallet__data.map((item, index) => (
              <Col lg="3" md="4" sm="6" key={index} className="mb-4">
                <div className="wallet__item">
                  <span>
                    <i className={item.icon}></i>
                  </span>
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Wallet;
