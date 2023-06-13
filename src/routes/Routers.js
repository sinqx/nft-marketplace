import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Market from "../pages/Market";
import Create from "../pages/Сreate";
import Contact from "../pages/Contact";

import Wallet from "../pages/Wallet";
import NftDetails from "../pages/NftDetails";
import MyNft from "../pages/MyNft";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/market" element={<Market />} />
      <Route path="/create" element={<Create />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/market/:id" element={<NftDetails />} />
      <Route path="/my-nft" element={<MyNft />} />
    </Routes>
  );
};

export default Routers;
