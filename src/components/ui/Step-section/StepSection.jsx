import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import "./step-section.css";

const STEP__DATA = [
  {
    title: "Подключите ваш кошелёк",
    desc: "Торгуйте NFT картинами и отслеживайте их в своей блокчейн кошельке",
    icon: "ri-wallet-line",
  },

  {
    title: "Создавайте свои NFT",
    desc: "Продавайте и покупайте NFT и зарабатывайте на этом, как на прямой продаже, так и от их Роялтис ",
    icon: "ri-layout-masonry-line",
  },

  {
    title: "Выставляйте на продажу физические Картины",
    desc: "Фотографируйте свои настоящие картины и продавайте за криптовалюту или же за реальные деньги ",
    icon: "ri-image-line",
  },

  {
    title: "Коллекционируйте",
    desc: "Создавайте свою собственную и неповторимую коллекцию из NFT и физических картин, становитесь популярнее и попадайте в топ сайта",
    icon: "ri-list-check",
  },
];

const StepSection = () => {
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-4">
            <h3 className="step__title">Продавайте и создавайте свои картины</h3>
          </Col>

          {STEP__DATA.map((item, index) => (
            <Col lg="3" md="4" sm="6" key={index} className="mb-4">
              <div className="single__step__item">
                <span>
                  <i className={item.icon}></i>
                </span>
                <div className="step__item__content">
                  <h5>
                    <Link to="/help">{item.title}</Link>
                  </h5>
                  <p className="mb-0">{item.desc}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default StepSection;
