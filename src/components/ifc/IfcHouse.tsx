import { useIfcColumnLayout } from "@/hooks/layouts"
import React from "react"

type Props = {
  id: string
}

const IfcHouse = (props: Props) => {
  const { id } = props
  const ifcHouseLayout = useIfcColumnLayout(id)

  console.log(ifcHouseLayout)

  return null
}

export default IfcHouse
