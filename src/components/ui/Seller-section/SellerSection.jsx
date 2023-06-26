import React, { useState, useEffect } from "react";
import "./seller.css";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import defaultAvatar from "../../../assets/images/default-avatar.webp";
import { getTopCreators } from "../../../Blockchain.Services";
import { truncate } from '../../../store'

const SellerSection = () => {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const fetchCreators = async () => {
      const creators = await getTopCreators();
      setCreators(creators)
    };

    fetchCreators();
  }, []);

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <div className="seller__section-title">
              <h3>Топ NFT художников</h3>
            </div>
          </Col>

          {creators.map((item, index) => (
            <Col lg="2" md="3" sm="4" xs="6" key={index} className="mb-4">
              <Link to={`/user/${item.creator}`}>
                <div className="single__seller-card d-flex align-items-center gap-3">
                  <div className="seller__img">
                    <img src={defaultAvatar} alt="" className="w-100" />
                  </div>

                  <div className="seller__content">
                    <h6>{truncate(item.creator, 5, 5, 13)}</h6>
                    <h6>Создано: <br></br>{  item.countNFT} NFT</h6>
                  </div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default SellerSection;