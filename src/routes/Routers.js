import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Market from "../pages/Market";
import Create from "../pages/Сreate";
import Help from "../pages/Help";
import NftDetails from "../pages/NftDetails";
import UserNft from "../pages/UserNft";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/market" element={<Market />} />
      <Route path="/create" element={<Create />} />
      <Route path="/help" element={<Help />} />
      <Route path="/nft/:id" element={<NftDetails />} />
      <Route path="/user/:address" element={<UserNft />} />
    </Routes>
  );
};

export default Routers;
