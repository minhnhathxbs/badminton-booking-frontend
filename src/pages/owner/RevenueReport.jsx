import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueReport() {
  const [filter, setFilter] = useState("2026");

  const data = [
    { month: "Tháng 1", revenue: 15000000 },
    { month: "Tháng 2", revenue: 18500000 },
    { month: "Tháng 3", revenue: 12000000 },
    { month: "Tháng 4", revenue: 22000000 },
    { month: "Tháng 5", revenue: 25000000 },
    { month: "Tháng 6", revenue: 12500000 }, // Current month
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Báo cáo doanh thu
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Thống kê doanh thu theo thời gian
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
        >
          <option value="2026">Năm 2026</option>
          <option value="2025">Năm 2025</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">
            Tổng doanh thu năm
          </div>
          <div className="text-2xl font-bold text-[#349DFF]">
            {formatCurrency(105000000)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">
            Trung bình tháng
          </div>
          <div className="text-2xl font-bold text-[#0a192f]">
            {formatCurrency(17500000)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">
            Cơ sở hiệu quả nhất
          </div>
          <div className="text-xl font-bold text-[#0a192f] mt-1">
            Sân Cầu Lông Alpha
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-[#0a192f] mb-6">
          Biểu đồ doanh thu
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000000}M`}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#349DFF"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
