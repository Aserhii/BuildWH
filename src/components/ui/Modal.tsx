import React, { useRef } from "react";
import type { ReactNode } from "react";
import { useClickAway, useEscape } from "./utils";

export interface Props {
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

export default function Modal(props: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useClickAway(contentRef, props.onClose);
  useEscape(props.onClose);
  return (
    <div className="w-full h-full fixed inset-0 p-2 bg-[rgba(0,0,0,0.6)] z-50 flex items-center justify-center">
      <div
        ref={contentRef}
        className="max-w-md bg-white rounded shadow-lg p-4 space-y-4"
      >
        <h2 className="text-lg">{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
}
