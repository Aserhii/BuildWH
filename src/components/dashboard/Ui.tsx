import React, { type FC, type ReactNode } from "react"

export const colorScheme = [
  "#FAFF00",
  "#ADFF00",
  "#3EFF80",
  "#7DFFE0",
  "#90EBFF",
  "#4193FF",
  "#E09EFF",
  "#FFA1E4",
  "#F73063",
  "#FF7426",
]

export const DataPoint: FC<{
  value: number
  unitOfMeasurement: string
  description: string
}> = (props) => {
  return (
    <div className="text-white space-y-2">
      <p className="text-5xl">{`${props.value.toLocaleString("en-GB", {
        maximumFractionDigits: 1,
      })}${props.unitOfMeasurement}`}</p>
      <p className="text-sm">{props.description}</p>
    </div>
  )
}

export const ChangeDataPoint: FC<{
  value: number
  reference: number
  description: string
}> = (props) => {
  if (props.reference === 0) {
    return null
  }

  const percentage = (props.value / props.reference) * 100 - 100
  return (
    <div className="max-w-[140px] space-y-1 text-right text-gray-300">
      <p className="text-3xl">
        <span className="inline-block pt-1 text-xl">
          {percentage < 0 ? "↓ " : "↑ "}
        </span>
        <span>{`${Math.abs(percentage).toLocaleString("en-GB", {
          maximumFractionDigits: 0,
        })}%`}</span>
      </p>
      <p className="text-sm">{props.description}</p>
    </div>
  )
}

export const Labeled: FC<{ label: string; children: ReactNode }> = (props) => (
  <div className="space-y-8">
    <p className="text-sm text-white">{props.label}</p>
    <div className="space-y-4">{props.children}</div>
  </div>
)

export const Titled: FC<{
  title: string
  subtitle: string
  children: ReactNode
}> = (props) => (
  <div className="space-y-8">
    <div className="space-y-1">
      <h3 className="text-xl text-white">{props.title}</h3>
      <p className="text-sm text-white">{props.subtitle}</p>
    </div>
    <div className="space-y-4">{props.children}</div>
  </div>
)
