import React, { type FC, type ReactNode } from "react"
import { type DashboardData } from "../data"
import { ChangeDataPoint, Titled } from "../Ui"
import StackedBarChart from "../charts/StackedBarChart"
import SquareChart from "../charts/SquareChart"
import CircleChart from "../charts/CircleChart"
import { formatWithUnit, formatWithUnitLong } from "../data"

const GridLayout: FC<{ children: ReactNode }> = (props) => (
  <div className="px-4 py-16 border-b border-gray-400 grid grid-cols-1 gap-x-16 last:border-b-0 md:grid-cols-4 md:space-y-0">
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

  const { totalHeatingDemand, energyDemandComparative } =
    dashboardData.energyUse

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
            <p className="text-5xl">{formatWithUnit(dashboardData.costs.total, "€")}</p>
            <ChangeDataPoint
              value={dashboardData.costs.total}
              reference={dashboardData.costs.comparative}
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
            {dashboardData.areas.totalFloor > 0 && (
              <div className="text-gray-300 space-y-1">
                <p className="text-3xl">
                  {formatWithUnitLong(
                    dashboardData.costs.total / dashboardData.areas.totalFloor,
                    "€/m²"
                  )}
                </p>
                <p className="text-sm">cost per floor area</p>
              </div>
            )}
          </div>
        </Titled>
        <Titled title="Energy use" subtitle="Estimated annual">
          <CircleChart
            value={totalHeatingDemand}
            comparative={energyDemandComparative}
            unitOfMeasurement="kWhr/year"
          />
          <div className="flex justify-end">
            <ChangeDataPoint
              value={totalHeatingDemand}
              reference={energyDemandComparative}
              description="Compared to traditional new build"
            />
          </div>
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
              {formatWithUnit(dashboardData.operationalCo2.annualTotal, "T")}
            </p>
            <ChangeDataPoint
              value={dashboardData.operationalCo2.annualTotal / 1000}
              reference={dashboardData.operationalCo2.annualComparative / 1000}
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
          {dashboardData.embodiedCo2.total < 0 && (
            <div className="flex space-x-8">
              <p className="text-5xl">
                {formatWithUnit(dashboardData.embodiedCo2.total / 1000, "T")}
              </p>
              <p className="text-sm text-gray-300">
                Project will remove carbon dioxide from the atmosphere
              </p>
            </div>
          )}
        </Titled>
      </GridLayout>
    </div>
  )
}

export default OverviewTab
