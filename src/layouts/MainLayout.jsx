import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-gray-800 font-sans">
      <Header />
      <Outlet />
    </div>
  );
};

export default MainLayout;
