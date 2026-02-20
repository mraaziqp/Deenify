"use client";
import { useState } from "react";

export default function TasbeehCounter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount(count + 1);
  const handleReset = () => setCount(0);

  return (
    <div className="max-w-xs mx-auto p-6 bg-white rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">Tasbeeh Counter</h2>
      <div className="text-4xl font-bold mb-4">{count}</div>
      <button
        className="bg-primary text-white px-6 py-2 rounded mb-2 w-full"
        onClick={handleIncrement}
      >
        SubhanAllah
      </button>
      <button
        className="bg-secondary text-white px-4 py-2 rounded w-full"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
}
