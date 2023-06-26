import React from "react";

import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import "./footer.css";
import logoo from "../../assets/images/logo.svg";

import { Link } from "react-router-dom";

const MY__ACCOUNT = [
  {
    display: "Мой профиль",
    url: "/seller-profile",
  },
  {
    display: "Добавить картину",
    url: "/create",
  },
  {
    display: "коллекция",
    url: "/market",
  },
  {
    display: "Редактировать профиль",
    url: "/edit-profile",
  },
];

const COMPANY = [
  {
    display: "План сайта",
    url: "#",
  },
  {
    display: "Цели",
    url: "#",
  },
  {
    display: "Об универе",
    url: "#",
  },
  {
    display: "Что-то ещё",
    url: "/contact",
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg="3" md="6" sm="6" className="mb-4">
            <div className="logo">
              <h2 className=" d-flex gap-2 align-items-center ">
                <span>
                  <img 
                  src={logoo}
                  alt="logo"
                  className="logo"
                  />
                </span>
                uniVision
              </h2>
              <p>
                Проект создан в качестве дипломной работы
              </p>
            </div>
          </Col>

          <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>Мой Аккаунт</h5>
            <ListGroup className="list__group">
              {MY__ACCOUNT.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <Link to={item.url}> {item.display} </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          {/* <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>Ресурсы</h5>
            <ListGroup className="list__group">
              {RESOURCES.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <Link to={item.url}> {item.display} </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col> */}

          <Col lg="2" md="3" sm="6" className="mb-4">
            <h5>О проекте</h5>
            <ListGroup className="list__group">
              {COMPANY.map((item, index) => (
                <ListGroupItem key={index} className="list__item">
                  <Link to={item.url}> {item.display} </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col lg="3" md="6" sm="6" className="mb-4">
            <h5>Обратная связь</h5>
            <input type="text" className="newsletter" placeholder="Email" />
            <div className="social__links d-flex gap-3 align-items-center ">
              <span>
                <Link to="#">
                  <i className="ri-facebook-line"></i>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-instagram-line"></i>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-telegram-line"></i>
                </Link>
              </span>
            </div>
          </Col>

          <Col lg="12" className=" mt-4 text-center">
            <p className="copyright">
              {" "}
              Аспеков Артур. КГТУ - ИВТ 1-19{" "}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
