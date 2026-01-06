import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { MinusCircle, Loader2, CheckCircle } from "lucide-react"; // ✅ dùng lucide-react

const COLORS = ["#FF9800", "#2196F3", "#E91E63"]; // To Do, In Progress, Done

const Status = ({ workItems }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  // theo dõi phần tử có hiển thị trên màn hình
  useEffect(() => {
    const chartElement = chartRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );

    if (chartElement) observer.observe(chartElement);
    return () => {
      if (chartElement) observer.unobserve(chartElement);
    };
  }, []);

  // lọc bỏ Review
  const filteredItems = workItems.filter(item => item.status !== "Review");

  const total = filteredItems.length;
  const toDo = filteredItems.filter((item) => item.status === "To Do").length;
  const inProgress = filteredItems.filter((item) => item.status === "In Progress").length;
  const done = filteredItems.filter((item) => item.status === "Done").length;

  const chartData = [
    { name: "Chưa thực hiện", value: toDo },
    { name: "Đang thực hiện", value: inProgress },
    { name: "Đã hoàn thành", value: done },
  ];

  const getPercentage = (value) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(0)}%`;
  };

  return (
    <div className="p-6 w-full h-full rounded-3xl bg-white shadow-lg border border-indigo-200">
      <h2 className="text-xl font-semibold mb-4 text-center text-indigo-700">
        Trạng thái công việc
      </h2>

      <div ref={chartRef} className="relative flex justify-center items-center mb-6">
        <PieChart width={300} height={170}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            isAnimationActive={isVisible}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>

        <div className="absolute text-center">
          {activeIndex !== null ? (
            <>
              <div className="text-2xl font-bold text-gray-800">
                {getPercentage(chartData[activeIndex].value)}
              </div>
              <div className="text-sm text-gray-500">
                {chartData[activeIndex].name}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-500">Tổng</div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {[
          { icon: MinusCircle, text: "Chưa thực hiện", value: toDo, color: "text-orange-600" },
          { icon: Loader2, text: "Đang thực hiện", value: inProgress, color: "text-blue-600" },
          { icon: CheckCircle, text: "Đã hoàn thành", value: done, color: "text-pink-600" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 cursor-pointer max-w-fit hover:opacity-80 ${item.color}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <Icon className="w-5 h-5" />
              <span>
                {item.text}: {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Status;
