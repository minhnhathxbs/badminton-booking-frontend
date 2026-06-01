import React, { useState } from "react";

export default function ManageBookings() {
  const [selectedDate, setSelectedDate] = useState("2026-06-01");

  const courts = [
    { id: 1, name: "Sân 1" },
    { id: 2, name: "Sân 2" },
    { id: 3, name: "Sân 3" },
    { id: 4, name: "Sân 4" },
    { id: 5, name: "Sân 5" },
    { id: 6, name: "Sân 6" },
  ];

  const bookings = [
    {
      id: "BK1",
      courtId: 1,
      startTime: "07:00",
      endTime: "09:00",
      status: "Đã cọc",
      customer: "Nguyễn Văn A",
    },
    {
      id: "BK2",
      courtId: 2,
      startTime: "18:00",
      endTime: "20:00",
      status: "Đã đặt",
      customer: "Trần B",
    },
    {
      id: "BK3",
      courtId: 1,
      startTime: "17:00",
      endTime: "19:00",
      status: "Đang sử dụng",
      customer: "Lê C",
    },
    {
      id: "BK4",
      courtId: 3,
      startTime: "06:00",
      endTime: "07:00",
      status: "Đã hủy",
      customer: "Phạm D",
    },
    {
      id: "BK5",
      courtId: 4,
      startTime: "19:00",
      endTime: "21:00",
      status: "Đã cọc",
      customer: "Hoàng E",
    },
    {
      id: "BK6",
      courtId: 5,
      startTime: "15:00",
      endTime: "17:00",
      status: "Đã đặt",
      customer: "Vũ F",
    },
    {
      id: "BK7",
      courtId: 6,
      startTime: "20:00",
      endTime: "22:00",
      status: "Đang sử dụng",
      customer: "Ngô G",
    },
  ];

  const START_HOUR = 5;
  const END_HOUR = 23;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const CELL_WIDTH = 140;
  const COURT_COL_WIDTH = 100;
  const TIMELINE_WIDTH = TOTAL_HOURS * CELL_WIDTH;

  const getPositionAndWidth = (startTime, endTime) => {
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };

    const startH = parseTime(startTime);
    const endH = parseTime(endTime);

    const left = (startH - START_HOUR) * CELL_WIDTH;
    const width = (endH - startH) * CELL_WIDTH;

    return { left: `${left}px`, width: `${width}px` };
  };

  const getColorClass = (status) => {
    switch (status) {
      case "Đã đặt":
        return "bg-[#3b82f6] text-white border border-[#2563eb]";
      case "Đang sử dụng":
        return "bg-[#22c55e] text-white border border-[#16a34a]";
      case "Đã hủy":
        return "bg-[#ef4444] text-white border border-[#dc2626]";
      case "Đã cọc":
        return "bg-[#fde047] text-[#0a192f] border border-[#eab308]";
      default:
        return "bg-gray-300 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#0a192f] mr-4">
            Lịch đặt sân
          </h2>
          <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
            Hôm nay
          </button>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
            <div className="px-3 text-gray-500 bg-gray-50 border-r border-gray-300 flex items-center justify-center h-full">
              <i className="fa-regular fa-calendar"></i>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm outline-none text-gray-700 font-medium bg-white"
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
            <button className="px-3 hover:bg-gray-100 border-r border-gray-300 h-full flex items-center justify-center transition">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button className="px-3 hover:bg-gray-100 h-full flex items-center justify-center transition">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
          <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none h-9 bg-white">
            <option>Chọn sân</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 inline-block"></span>
            <span className="text-sm font-medium">Chủ sân</span>
          </div>
          <button className="bg-[#349DFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition shadow-sm">
            + Tạo đặt sân
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto relative custom-scrollbar">
          <div
            style={{ width: `${COURT_COL_WIDTH + TIMELINE_WIDTH}px` }}
            className="border-b border-gray-200"
          >
            <div className="flex h-12 border-b border-gray-300 bg-[#f8fafc] sticky top-0 z-30">
              <div
                style={{ width: `${COURT_COL_WIDTH}px` }}
                className="flex-shrink-0 border-r border-gray-300 sticky left-0 z-40 bg-[#f8fafc]"
              ></div>
              <div
                className="relative"
                style={{ width: `${TIMELINE_WIDTH}px` }}
              >
                {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
                  const hour = START_HOUR + i;
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-gray-300 flex items-center justify-center"
                      style={{
                        left: `${i * CELL_WIDTH}px`,
                        width: `${CELL_WIDTH}px`,
                      }}
                    >
                      <span className="text-[13px] font-bold text-[#0a192f]">
                        {hour}:00
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {courts.map((court, index) => (
                <div
                  key={court.id}
                  className={`flex h-24 ${index !== courts.length - 1 ? "border-b border-gray-200" : ""} bg-white hover:bg-gray-50/50 transition-colors group`}
                >
                  <div
                    style={{ width: `${COURT_COL_WIDTH}px` }}
                    className="flex-shrink-0 flex items-center justify-center font-bold text-sm text-[#0a192f] border-r border-gray-300 sticky left-0 z-20 bg-white group-hover:bg-gray-50/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                  >
                    {court.name}
                  </div>

                  <div
                    className="relative"
                    style={{ width: `${TIMELINE_WIDTH}px` }}
                  >
                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-gray-200 pointer-events-none"
                        style={{
                          left: `${i * CELL_WIDTH}px`,
                          width: `${CELL_WIDTH}px`,
                        }}
                      ></div>
                    ))}

                    {bookings
                      .filter((b) => b.courtId === court.id)
                      .map((booking) => {
                        const { left, width } = getPositionAndWidth(
                          booking.startTime,
                          booking.endTime,
                        );
                        return (
                          <div
                            key={booking.id}
                            className={`absolute top-2.5 bottom-2.5 rounded-lg px-3 py-2 shadow-sm overflow-hidden flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md z-10 ${getColorClass(booking.status)}`}
                            style={{ left, width }}
                            title={`${booking.customer} (${booking.startTime} - ${booking.endTime})`}
                          >
                            <div className="font-bold text-[14px] truncate leading-tight">
                              {booking.customer}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-16 bg-[#f8fafc] border-t border-gray-200 flex items-center justify-center gap-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#3b82f6] border border-[#2563eb] inline-block shadow-sm"></span>
            <span className="text-sm font-medium text-[#0a192f]">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#22c55e] border border-[#16a34a] inline-block shadow-sm"></span>
            <span className="text-sm font-medium text-[#0a192f]">
              Đang sử dụng
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#fde047] border border-[#eab308] inline-block shadow-sm"></span>
            <span className="text-sm font-medium text-[#0a192f]">Đã cọc</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#ef4444] border border-[#dc2626] inline-block shadow-sm"></span>
            <span className="text-sm font-medium text-[#0a192f]">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
