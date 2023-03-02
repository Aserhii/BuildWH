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
            <div className="flex-shrink-0">
              <div className="h-16 w-24">
                <svg
                  width="104"
                  height="70"
                  viewBox="0 0 104 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M103.144 0.796875H0.209961V69.4316H103.144V0.796875Z"
                    fill="#164194"
                  />
                  <path
                    d="M49.463 15.75L51.6407 14.153L53.8184 15.75L52.9836 13.173L55.1976 11.6123H52.4755L51.6407 8.99902L50.8059 11.6123H48.0837L50.2978 13.173L49.463 15.75Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M38.2474 18.7627L40.3888 17.1657L42.5666 18.7627L41.7681 16.1857L43.9458 14.625H41.2236L40.3888 12.0117L39.554 14.625H36.8682L39.0459 16.1857L38.2474 18.7627Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M32.1861 20.25L31.3513 22.8633H28.6292L30.8432 24.4603L30.0084 27.001L32.1861 25.4403L34.3638 27.001L33.529 24.4603L35.7431 22.8633H33.0209L32.1861 20.25Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M29.1737 36.6559L31.3514 38.2166L30.5166 35.6759L32.7306 34.0789H30.0085L29.1737 31.502L28.3389 34.0789H25.6167L27.8307 35.6759L26.9959 38.2166L29.1737 36.6559Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M33.0209 45.3309L32.1861 42.7539L31.3513 45.3309H28.6292L30.8432 46.9279L30.0084 49.5049L32.1861 47.9079L34.3638 49.5049L33.529 46.9279L35.7431 45.3309H33.0209Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M41.2599 53.5701L40.4251 50.9932L39.5903 53.6064L36.8682 53.5701L39.0822 55.1671L38.2474 57.7441L40.4251 56.1471L42.6028 57.7441L41.7681 55.1671L43.9821 53.5701H41.2599Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M52.4755 56.582L51.6407 53.9688L50.8059 56.582H48.0837L50.2978 58.1427L49.463 60.7197L51.6407 59.1227L53.8184 60.7197L52.9836 58.1427L55.1976 56.582H52.4755Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M63.6907 53.5701L62.8922 50.9932L62.0574 53.6064L59.3352 53.5701L61.5129 55.1671L60.7144 57.7441L62.8922 56.1471L65.0336 57.7441L64.2351 55.1671L66.4128 53.5701H63.6907Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M71.966 45.3309L71.1312 42.7539L70.2964 45.3309H67.5742L69.7882 46.9279L68.9534 49.5049L71.1312 47.9079L73.2726 49.5049L72.4741 46.9279L74.6518 45.3309H71.966Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M77.6642 34.0428H74.942L74.1072 31.4658L73.2725 34.0428H70.5503L72.7643 35.6398L71.9295 38.2168L74.1072 36.6198L76.285 38.2168L75.4502 35.6398L77.6642 34.0428Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M68.9534 26.9658L71.1312 25.4051L73.2726 26.9658L72.4741 24.4251L74.6518 22.8281H71.966L71.1312 20.2148L70.2964 22.8281H67.5742L69.7882 24.4251L68.9534 26.9658Z"
                    fill="#FFED00"
                  />
                  <path
                    d="M62.892 12.0117L62.0572 14.625H59.3713L61.5491 16.222L60.7506 18.7627L62.892 17.1657L65.0697 18.7627L64.2349 16.222L66.449 14.625H63.7268L62.892 12.0117Z"
                    fill="#FFED00"
                  />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium not-italic leading-4 text-black">
                Intereg / North-West Europe
              </div>
              <p className="text-sm font-medium not-italic leading-4 text-gray-500">
                {" "}
                Housing 4.0 Energy
              </p>
            </div>
          </div>

          <div className="pl-3 font-normal not-italic leading-3 text-blue-800">
            {" "}
            EUROPEAN UNION{" "}
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
              3CEA
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
