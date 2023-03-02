import React, { useState } from "react";
import type { ReactNode } from "react";

export interface Props {
  label: string;
  children?: ReactNode;
  long?: boolean;
}

export default function ContextMenuNested(props: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <div
        className={`py-2 px-3 text-left text-sm ${
          hovered ? "bg-gray-100" : ""
        }`}
      >
        {props.label}
      </div>
      {hovered ? (
        <div
          className={`absolute top-0 z-20 bg-white left-full ${
            props.long ? "w-64" : "w-48"
          }`}
        >
          {props.children}
        </div>
      ) : null}
    </div>
  );
}
