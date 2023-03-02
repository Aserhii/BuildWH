import React, { type FC, type ReactNode } from "react"
import { type DashboardData } from "../data"
import { ChangeDataPoint, Titled } from "../Ui"
import StackedBarChart from "../charts/StackedBarChart"
import SquareChart from "../charts/SquareChart"
import CircleChart from "../charts/CircleChart"
import { formatWithUnit, formatWithUnitLong } from "../data"

const GridLayout: FC<{ children: ReactNode }> = (props) => (
  <div className="px-4 py-16 border-b border-gray-400 grid grid-cols-1 gap-x-8 last:border-b-0 md:grid-cols-4 md:space-y-0">
    {props.children}
  </div>
)

const OverviewTab: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props

  const costs = Object.values(dashboardData.byHouse).map((d) => d.costs)

  const embodiedCo2 = Object.values(dashboardData.byHouse).map(
    (d) => d.embodiedCo2
  )

  const operationalCo2 = Object.values(dashboardData.byHouse).map(
    (d) => d.operationalCo2
  )

  const totalCost = costs.reduce(
    (accumulator, cost) => accumulator + cost.total,
    0
  )
  const totalComparativeCost = costs.reduce(
    (accumulator, cost) => accumulator + cost.comparative,
    0
  )

  const totalOperationalCo2 = operationalCo2.reduce(
    (accumulator, co2) => accumulator + co2.annualTotal / 1000,
    0
  )

  const totalOperationalCo2Comparative = operationalCo2.reduce(
    (accumulator, co2) => accumulator + co2.annualComparative / 1000,
    0
  )

  const totalEmbodiedCo2 = embodiedCo2.reduce(
    (accumulator, co2) => accumulator + co2.total / 1000,
    0
  )

  return (
    <div className="text-white">
      <GridLayout>
        <Titled title="Build cost" subtitle="Estimated EUR">
          <StackedBarChart
            data={[
              costs.map((cost) => cost.total),
              costs.map((cost) => cost.comparative),
            ]}
            unitOfMeasurement="€"
          />
          <div className="flex space-x-8">
            <p className="text-5xl">{formatWithUnit(totalCost, "€")}</p>
            <ChangeDataPoint
              value={totalCost}
              reference={totalComparativeCost}
              description="Compared to traditional new build"
            />
          </div>
        </Titled>
        <Titled title="Floor area" subtitle="Gross internal area m²">
          <SquareChart
            data={Object.values(dashboardData.byHouse).map(
              (houseInfo) => houseInfo.areas.totalFloor
            )}
            unitOfMeasurement="m²"
          />
          <div className="flex space-x-8">
            <p className="text-5xl">
              {formatWithUnit(dashboardData.areas.totalFloor, "m²")}
            </p>
            <div className="text-gray-300 space-y-1">
              <p className="text-3xl">
                {formatWithUnitLong(
                  dashboardData.costs.total / dashboardData.areas.totalFloor,
                  "€/m²"
                )}
              </p>
              <p className="text-sm">cost per floor area</p>
            </div>
          </div>
        </Titled>
        <Titled title="Energy use" subtitle="Estimated annual">
          <CircleChart
            data={Object.values(dashboardData.byHouse).map(
              (houseInfo) => houseInfo.energyUse.totalHeatingCost
            )}
            unitOfMeasurement="€"
          />
        </Titled>
        <Titled title="Carbon emissions" subtitle="Estimated annual">
          <StackedBarChart
            data={[
              operationalCo2.map((co2) => co2.annualTotal / 1000),
              operationalCo2.map((co2) => co2.annualComparative / 1000),
            ]}
            unitOfMeasurement="T"
          />
          <div className="flex space-x-8">
            <p className="text-5xl">
              {formatWithUnit(totalOperationalCo2, "T")}
            </p>
            <ChangeDataPoint
              value={totalOperationalCo2}
              reference={totalOperationalCo2Comparative}
              description="Compared to traditional new build"
            />
          </div>
        </Titled>
      </GridLayout>
      <GridLayout>
        <Titled title="Carbon emissions" subtitle="Estimated upfront">
          <StackedBarChart
            data={[
              embodiedCo2.map((co2) => co2.total / 1000),
              embodiedCo2.map((co2) => co2.comparative / 1000),
            ]}
            unitOfMeasurement="T"
          />
          <div className="flex space-x-8">
            <p className="text-5xl">{formatWithUnit(totalEmbodiedCo2, "T")}</p>
            <p className="text-gray-300 text-sm">
              Project will remove carbon dioxide from the atmosphere
            </p>
          </div>
        </Titled>
      </GridLayout>
    </div>
  )
}

export default OverviewTab
