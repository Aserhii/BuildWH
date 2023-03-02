import React from "react"
import { FeedbackFish } from "@feedback-fish/react"
import { Close } from "./icons"

export interface Props {
  className?: string
  onClose?: () => void
}

export default function BetaBanner(props: Props) {
  return (
    <div
      className={`flex items-center justify-between bg-white shadow ${
        props.className || ""
      }`}
    >
      <div className="flex items-center space-x-2 text-xs">
        <span className="inline-block bg-gray-100 px-2 py-2 font-bold uppercase tracking-wider">
          Prototype
        </span>
        <p>
          This tool is in development. Please give us
          <FeedbackFish projectId="722731cad3a24a">
            <button className="inline-block px-1 underline hover:text-blue-800">
              suggestions and feedback
            </button>
          </FeedbackFish>
          for how we can improve it.
        </p>
      </div>
      {props.onClose && (
        <button className="h-8 w-8 hover:bg-gray-100" onClick={props.onClose}>
          <Close />
        </button>
      )}
    </div>
  )
}
