import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import NftCard from "../Nft-card/NftCard";
import { getActiveNFTs } from "../../../Blockchain.Services";
import "./live-auction.css";

const LiveAuction = () => {
  const [auctionFilter, setAuctionFilter] = useState([]); // добавлено новое состояние

  useEffect(() => {
    const fetchData = async () => {
      const nfts = await getActiveNFTs();
      if (nfts !== null) { // проверяем, не равен ли результат null
        setAuctionFilter(nfts.filter((item) => item.onAuction));   // фильтруем и устанавливаем исходные данные в auctionFilter
      }
    };
    fetchData();
  }, []);

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <div className="live__auction__top d-flex align-items-center justify-content-between ">
              <h3>Аукционы</h3>
              <span>
                <Link to="/market">Смотреть ещё</Link>
              </span>
            </div>
          </Col>

          {auctionFilter.slice(0, 4).map((item, index) => (
            <Col lg="3" key={index} md="4" sm="6" className="mb-4">
              <NftCard item={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default LiveAuction;
