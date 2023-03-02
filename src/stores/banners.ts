import { Dispatch, SetStateAction } from "react"
import { proxy } from "valtio"

const banners = proxy({
  partnersInfoBanner: false,
  betaBanner: true,
})

export const setPartnersInfoBanner: Dispatch<SetStateAction<boolean>> = (x) => {
  banners.partnersInfoBanner =
    typeof x === "boolean" ? x : x(banners.partnersInfoBanner)
}

export const setBetaBanner: Dispatch<SetStateAction<boolean>> = (x) => {
  banners.betaBanner = typeof x === "boolean" ? x : x(banners.betaBanner)
}

export default banners
