import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-gray-800 font-sans">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
