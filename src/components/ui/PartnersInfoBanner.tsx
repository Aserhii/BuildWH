import Image from "next/image"
import React, { useRef, useCallback } from "react"
import { useClickAway, useEscape } from "./utils"

export interface Props {
  expanded: boolean
  onClose: () => void
}

function PartnersInfoBanner(props: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const onCloseIfExpanded = useCallback(() => {
    if (props.expanded) {
      props.onClose()
    }
  }, [props.expanded, props.onClose])

  useClickAway(containerRef, onCloseIfExpanded)

  useEscape(onCloseIfExpanded)

  return (
    <div
      ref={containerRef}
      className={`absolute -bottom-0 z-20 h-60 w-screen overflow-auto bg-white p-8 shadow-lg transition-all duration-300 ${
        props.expanded ? "" : "translate-y-full transform"
      }`}
    >
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="h-6 pb-8 pl-3 text-base font-normal not-italic leading-5 text-black">
            Developed By
          </div>

          <div className="flex max-w-sm space-x-4 p-3">
            <div className="flex-shrink-0">
              <div className="h-16 w-24">
                <svg
                  width="95"
                  height="38"
                  viewBox="0 0 95 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M34.5767 18.8182C34.5767 6.92188 27.1903 0.139203 17.549 0.139203C7.8544 0.139203 0.521307 6.92188 0.521307 18.8182C0.521307 30.6612 7.8544 37.4972 17.549 37.4972C27.1903 37.4972 34.5767 30.7145 34.5767 18.8182ZM26.782 18.8182C26.782 26.5241 23.1243 30.6967 17.549 30.6967C11.956 30.6967 8.31605 26.5241 8.31605 18.8182C8.31605 11.1122 11.956 6.93963 17.549 6.93963C23.1243 6.93963 26.782 11.1122 26.782 18.8182ZM58.9984 11.0945H66.367C66.2605 4.61363 60.9338 0.139203 52.8372 0.139203C44.8649 0.139203 39.0233 4.54261 39.0588 11.1477C39.041 16.5099 42.823 19.5817 48.9664 21.0554L52.926 22.0497C56.8855 23.0085 59.0872 24.1449 59.1049 26.5952C59.0872 29.2585 56.5659 31.0696 52.6596 31.0696C48.6646 31.0696 45.7882 29.223 45.5396 25.5831H38.1C38.2953 33.4489 43.9238 37.5149 52.7484 37.5149C61.6262 37.5149 66.8464 33.2713 66.8642 26.6129C66.8464 20.5582 62.2832 17.3445 55.9622 15.924L52.6951 15.1428C49.5346 14.4148 46.889 13.2429 46.9423 10.6328C46.9423 8.28906 49.0197 6.56676 52.7839 6.56676C56.4593 6.56676 58.7143 8.23579 58.9984 11.0945ZM71.0355 37H94.3132V30.6612H78.7237V0.636363H71.0355V37Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium not-italic leading-4 text-black">
                Open Systems Lab
              </div>
              <p className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                UK{" "}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="h-6 pb-8 pl-3 text-base font-normal not-italic leading-5 text-black">
            Supported By
          </div>

          <div className="flex max-w-sm space-x-4 p-3">
            <Image
              src="/housing-40-energy_interreg_north-west-europe_f_cmyk.png"
              width={714}
              height={304}
            />
          </div>
        </div>

        <div>
          <div className="pl-3 ">
            <div className="h-6 pb-8 text-base font-normal not-italic leading-5 text-black">
              In collaboration with
            </div>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              Vlaams Brabant
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                BE{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              Woningbouw Atelier
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                NL{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              {"South East Energy Agency (AMVIC)"}
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                IE{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              EIfI Tech
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                DE{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              Geemente Almere
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                NL{" "}
              </span>
            </p>
          </div>
        </div>

        <div>
          <div className="pl-3 ">
            <div className="h-6 pb-8 text-base font-normal not-italic leading-5 text-black">
              {" "}
            </div>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              South West College
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                IE{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              TU Delft
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                NL{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              Kamp C
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                BE{" "}
              </span>
            </p>
            <p className="pb-1 text-sm font-medium not-italic leading-4 text-black">
              {" "}
              Holtz 100
              <span className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                DE{" "}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnersInfoBanner
