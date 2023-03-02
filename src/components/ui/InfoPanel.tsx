import React from "react"

export interface Props {
  data: Array<{ label: string; value: string }>
}

function InfoPanel(props: Props) {
  return (
    <div className="pointer-events-none absolute bottom-8 right-12 z-10 space-y-4 text-gray-500">
      {props.data.map((d, index) => (
        <div key={index}>
          <p className="text-sm">{d.label}</p>
          <p className="text-2xl">{d.value}</p>
        </div>
      ))}
    </div>
  )
}

export default InfoPanel
