import type { ReactElement } from "react"
import React from "react"

interface Props<T> {
  selected: T
  options: Array<{
    label: string | ReactElement
    value: T
    thumbnail?: string
  }>
  onChange: (newSelected: T) => void
  onHoverChange?: (newHovered: T | null) => void
  id?: string
  label?: string
  compare?: (a: T, b: T) => boolean
}

export default function Radio<T>(props: Props<T>) {
  // const anyThumbnails = any(
  //   (option) => Boolean(option.thumbnail),
  //   props.options
  // )

  // const hoverStream = useStream<T | null>()

  // useEffect(() => {
  //   const hoverStreamProcessed = hoverStream.stream
  //     .compose(debounce(100))
  //     .compose(dropRepeats((x, y) => x === y))
  //   const streamListener: Partial<Listener<T | null>> = {
  //     next: (newHovered) => {
  //       props.onHoverChange && props.onHoverChange(newHovered)
  //     },
  //   }
  //   hoverStreamProcessed.addListener(streamListener)
  //   return () => {
  //     hoverStreamProcessed.removeListener(streamListener)
  //   }
  // }, [hoverStream.stream])

  return (
    <div>
      {props.label && (
        <p className="select-none px-3 py-3 text-sm font-bold">{props.label}</p>
      )}
      {props.options.map((option, index) => {
        const checked = props.compare
          ? props.compare(option.value, props.selected)
          : option.value === props.selected

        return (
          <label
            key={index}
            htmlFor={`radio-${props.id}-${index}`}
            className="flex w-full cursor-pointer justify-between hover:bg-gray-100"
            // onMouseOver={() => {
            //   hoverStream.sendNext(option.value)
            // }}
            // onMouseOut={() => {
            //   hoverStream.sendNext(null)
            // }}
          >
            <input
              type="radio"
              className="sr-only"
              id={`radio-${props.id}-${index}`}
              checked={checked}
              onChange={() => {
                props.onChange(option.value)
              }}
            />
            {/* {anyThumbnails && (
            <div
              className="flex-none w-[36px] h-[36px] bg-center bg-cover"
              style={{ background: `url(${option.thumbnail})` }}
            ></div>
          )} */}
            {typeof option.label === "string" ? (
              <p className="flex flex-1 break-all px-3 py-2 text-sm">
                {option.label}
              </p>
            ) : (
              option.label
            )}
            <div className="flex h-[36px] w-[36px] items-center justify-center">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ease-in-out ${
                  checked ? "bg-green-400" : "bg-gray-300"
                }`}
              ></div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
