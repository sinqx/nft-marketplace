import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import "./trending.css";
import { getAllNFTs } from "../../../Blockchain.Services";
import NftCard from "../Nft-card/NftCard";

const Trending = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const nfts = await getAllNFTs();
      setData(nfts.sort((a, b) => b.id - a.id)); // сортируем массив по убыванию id
    };
    fetchData();
  }, []);


  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <h3 className="trending__title">Новые NFT</h3>
          </Col>

          {data.slice(0, 8).map((item) => (
            <Col lg="3" md="4" sm="6" key={item.id} className="mb-4">
              <NftCard item={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Trending;
