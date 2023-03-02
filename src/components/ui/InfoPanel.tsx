import React from "react";

export interface Props {
  data: Array<{ label: string; value: string }>;
}

export default function InfoPanel(props: Props) {
  return (
    <div className="absolute z-10 text-gray-500 bottom-8 right-12 space-y-4">
      {props.data.map((d, index) => (
        <div key={index}>
          <p className="text-sm">{d.label}</p>
          <p className="text-2xl">{d.value}</p>
        </div>
      ))}
    </div>
  );
}
