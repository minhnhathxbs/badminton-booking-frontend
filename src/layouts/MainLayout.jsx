import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-gray-800 font-sans">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
