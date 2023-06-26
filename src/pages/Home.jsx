import React, { useEffect } from "react";

import HeroSection from "../components/ui/HeroSection";
import LiveAuction from "../components/ui/Live-auction/LiveAuction";
import SellerSection from "../components/ui/Seller-section/SellerSection";
import Trending from "../components/ui/Trending-section/Trending";
import StepSection from "../components/ui/Step-section/StepSection";
import { isWalletConnected } from "../Blockchain.Services";

const Home = () => {
  useEffect(() => {
    const checkWalletConnection = async () => {
      const isConnected = await isWalletConnected();
      if (isConnected) {
        // здесь можно выполнить дополнительные действия после подключения кошелька
      }
    }

    checkWalletConnection();
  }, []);

  return (
    <>
      <HeroSection />
      <LiveAuction />
      <SellerSection />
      <Trending />
      <StepSection />
    </>
  );
};

export default Home;