import React, { useEffect, useState  } from "react";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import { Container, Row, Col } from "reactstrap";
import { getActiveNFTs, isWalletConnected } from "../Blockchain.Services.jsx";
import "../styles/market.css";

await  isWalletConnected();

const Market = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // добавлено новое состояние
  const [sortType, setSortType] = useState("new"); // новые по умолчанию

  useEffect(() => {
    const fetchData = async () => {
      const nfts = await getActiveNFTs();  // поменять на getActiveNFTs()
      setData(nfts);
      setFilteredData(nfts); // устанавливаем исходные данные в filteredData
    };
    fetchData();
  }, []);


  const handleCategory = (e) => {
    const category = e.target.value;

    let filteredNfts = [...data];

    if (category === "sell") {
      filteredNfts = filteredNfts.filter((item) => item.onSale );
    } else if (category === "auction") {
      filteredNfts = filteredNfts.filter((item) => item.onAuction);
    }

    setFilteredData(filteredNfts); // сохраняем отфильтрованные данные в filteredData

    // проверяем, выбрана ли категория "Все категории"
    if (category === "Все категории") {
      setFilteredData(data);
      return;
    }
  };

  // ====== SORTING DATA BY HIGH, MID, LOW RATE =========
  const handleSort = (e) => {
    const filterValue = e.target.value;

    setSortType(filterValue);

    let sortedData = [...filteredData];

    if (filterValue === "new") {
      sortedData.sort((a, b) => b.id - a.id);
    } else if (filterValue === "old") {
      sortedData.sort((a, b) => a.id - b.id);
    }

    setFilteredData(sortedData); // сохраняем отсортированные данные в filteredData
  };

  return (
    <>
      <CommonSection title={"Торговая площадка NFT"} />

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="market__product__filter d-flex align-items-center justify-content-between">
                <div className="filter__left d-flex align-items-center gap-5">
                  <div className="all__category__filter">
                    <select onChange={handleCategory}>
                      <option>Все категории</option>
                      <option value="sell">Купить сейчас</option>
                      <option value="auction">Аукцион</option>
                    </select>
                  </div>
                </div>
                <div className="filter__right">
                  <select onChange={handleSort} value={sortType}>
                    <option value="new">Сначала новые</option>
                    <option value="old">Сначала старые</option>
                    <option value="mid">Сначала дороже</option>
                    <option value="low">Сначала дешевле</option>
                  </select>
                </div>
              </div>
            </Col>

            {filteredData?.map((item) => (
              <Col lg="3" md="4" sm="6" className="mb-4" key={item.id}>
                <NftCard item={item} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Market;
