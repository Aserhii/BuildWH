import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React from "react"

const Dashboard = () => {
  const houses = useHouses()
  const systemsData = useSystemsData()
  return (
    <div>
      <pre>{JSON.stringify({ houses, systemsData }, null, 2)}</pre>
    </div>
  )
}

export default Dashboard
