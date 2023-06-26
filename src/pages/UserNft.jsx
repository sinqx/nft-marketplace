import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import { getUserNFTs, isWalletConnected } from "../Blockchain.Services.jsx";
import { Container, Row, Col } from "reactstrap";
import { useGlobalState } from '../store'
import "../styles/market.css";

const UserNft = () => {
  const { address } = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortType, setSortType] = useState("new");
  const [connectedAccount] = useGlobalState('connectedAccount')
  useEffect(() => {
    const fetchData = async () => {
      await isWalletConnected();
      const nfts = await getUserNFTs(address);
      setData(nfts);
      setFilteredData(nfts);
    };
    fetchData();
  }, [address]);

  const handleCategory = (e) => {
    const category = e.target.value;

    let filteredNfts = [];

    switch (category) {
      case "sell":
        filteredNfts = data.filter((item) => item.onSale);
        break;
      case "auction":
        filteredNfts = data.filter((item) => item.onAuction);
        break;
      case "notActive":
        filteredNfts = data.filter((item) => !item.onSale && !item.onAuction);
        break;
      case "all":
      default:
        filteredNfts = data;
        break;
    }

    setFilteredData(filteredNfts);
  };

  const handleSort = (e) => {
    const filterValue = e.target.value;

    setSortType(filterValue);

    let sortedData = [...filteredData];

    if (filterValue === "new") {
      sortedData.sort((a, b) => b.id - a.id);
    } else if (filterValue === "old") {
      sortedData.sort((a, b) => a.id - b.id);
    }

    setFilteredData(sortedData);
  };

  return (
    <>
       {address === connectedAccount ? (
        <CommonSection title="My NFTs" />
      ) : (
        <CommonSection title={"User " + address} />
      )}

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="market__product__filter d-flex align-items-center justify-content-between">
                <div className="filter__left d-flex align-items-center gap-5">
                  <div className="all__category__filter">
                    <select onChange={handleCategory}>
                      <option>Все категории</option>
                      <option value="sell">Сейчас на продаже</option>
                      <option value="auction">Аукционы</option>
                      <option value="notActive">Не активны</option>
                    </select>
                  </div>
                </div>
                <div className="filter__right">
                  <select onChange={handleSort} value={sortType}>
                    <option value="new">Сначала новые</option>
                    <option value="old">Сначала старые</option>
                  </select>
                </div>
              </div>
            </Col>

            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Col lg="3" md="4" sm="6" className="mb-4" key={item.id}>
                  <NftCard item={item} />
                </Col>
              ))
            ) : (
              <div>Пользователь не имеет на данный момент NFT</div>
            )}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default UserNft;