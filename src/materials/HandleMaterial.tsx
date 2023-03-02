import { useSiteContext } from "@/stores/context"
import { useShadows } from "@/stores/settings"
import { useEffect, useMemo, useState } from "react"
import { Color, DoubleSide } from "three"

const HandleMaterial = () => {
  const white = useMemo(() => new Color("white"), [])
  const black = useMemo(() => new Color("black"), [])
  const [color, setColor] = useState(white)
  const [shadows] = useShadows()

  useEffect(() => {
    if (shadows) {
      setColor(white)
    } else {
      setColor(black)
    }
  }, [shadows])
  return (
    <meshStandardMaterial color={color} emissive={color} side={DoubleSide} />
  )
}

export default HandleMaterial
