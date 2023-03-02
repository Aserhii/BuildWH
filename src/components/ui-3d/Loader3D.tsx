import React from "react";
import { Html, useProgress } from "@react-three/drei";

const Loader3D = () => {
  const { progress } = useProgress();
  return (
    <Html center className="text-center space-y-2">
      <p className="text-xs text-gray-600">
        {Math.floor(Number(progress))} % loaded
      </p>
      <div style={{ width: 80, height: 4 }} className="bg-gray-300">
        <div
          style={{ width: `${Number(progress)}%` }}
          className="h-full bg-blue-400"
        />
      </div>
    </Html>
  );
};

export default Loader3D;
