import { Html, useProgress } from "@react-three/drei"
import React from "react"

const Loader3D = () => {
  const { progress } = useProgress()
  return (
    <Html center className="space-y-2 text-center">
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
  )
}

export default Loader3D
