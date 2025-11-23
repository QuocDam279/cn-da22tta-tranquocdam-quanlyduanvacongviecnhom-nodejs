import React, { useState } from "react";

export default function TaskProgressBar({ progress, onChange }) {
  const [value, setValue] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue); // chỉ cập nhật UI, KHÔNG gọi API
  };

  const handleCommit = () => {
    setIsDragging(false);

    // chỉ update API khi người dùng dừng kéo
    if (onChange) onChange(value);
  };

  return (
    <div className="w-full mt-3 select-none">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">Tiến độ</span>
        <span className="text-gray-600">{value}%</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        className="w-full cursor-pointer accent-blue-500"
        onChange={handleChange}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit} // mobile support
      />
    </div>
  );
}
