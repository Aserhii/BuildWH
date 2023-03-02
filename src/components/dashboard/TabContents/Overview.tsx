import React, { type FC, type ReactNode } from "react"
import { type DashboardData } from "../data"
import { ChangeDataPoint, Titled, defaultColor } from "../Ui"
import StackedBarChart from "../charts/StackedBarChart"
import SquareChart from "../charts/SquareChart"
import CircleChart from "../charts/CircleChart"
import { formatWithUnit, formatWithUnitLong } from "../data"

const GridLayout: FC<{ children: ReactNode }> = (props) => (
  <div className="grid grid-cols-1 gap-x-16 border-b border-gray-400 px-4 py-16 last:border-b-0 md:grid-cols-4 md:space-y-0">
    {props.children}
  </div>
)

const OverviewTab: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props

  const houseCosts = Object.entries(dashboardData.byHouse).map(
    ([houseId, d]) => ({
      value: d.costs.total,
      color: dashboardData.colorsByHouseId[houseId],
    })
  )

  const houseCostsComparative = Object.entries(dashboardData.byHouse).map(
    ([_houseId, d], index, arr) => ({
      value: d.costs.comparative,
      color: `hsl(0,0%,${
        70 + (arr.length === 1 ? 0 : (15 * index) / (arr.length - 1))
      }%)`,
    })
  )

  const houseOperationalCo2 = Object.entries(dashboardData.byHouse).map(
    ([houseId, d]) => ({
      value: d.operationalCo2.annualTotal / 1000,
      color: dashboardData.colorsByHouseId[houseId],
    })
  )

  const houseOperationalCo2Comparative = Object.entries(
    dashboardData.byHouse
  ).map(([_houseId, d], index, arr) => ({
    value: d.operationalCo2.annualComparative / 1000,
    color: `hsl(0,0%,${
      70 + (arr.length === 1 ? 0 : (15 * index) / (arr.length - 1))
    }%)`,
  }))

  const houseEmbodiedCo2 = Object.entries(dashboardData.byHouse).map(
    ([houseId, d]) => ({
      value: d.embodiedCo2.total / 1000,
      color: dashboardData.colorsByHouseId[houseId],
    })
  )

  const houseEmbodiedCo2Comparative = Object.entries(dashboardData.byHouse).map(
    ([_houseId, d], index, arr) => ({
      value: d.embodiedCo2.comparative / 1000,
      color: `hsl(0,0%,${
        70 + (arr.length === 1 ? 0 : (15 * index) / (arr.length - 1))
      }%)`,
    })
  )

  const { energyUse } = dashboardData

  return (
    <div className="text-white">
      <GridLayout>
        <Titled title="Build cost" subtitle="Estimated EUR">
          <StackedBarChart
            data={[houseCosts, houseCostsComparative]}
            unitOfMeasurement="€"
          />
          <div className="flex space-x-4">
            <p className="text-4xl">
              {formatWithUnit(dashboardData.costs.total, "€")}
            </p>
            <ChangeDataPoint
              value={dashboardData.costs.total}
              reference={dashboardData.costs.comparative}
              description="Compared to average new build"
            />
          </div>
        </Titled>
        <Titled title="Floor area" subtitle="Gross internal area m²">
          <SquareChart
            data={Object.entries(dashboardData.byHouse).map(
              ([houseId, houseInfo]) => ({
                value: houseInfo.areas.totalFloor,
                color: dashboardData.colorsByHouseId[houseId],
              })
            )}
            unitOfMeasurement="m²"
          />
          <div className="flex space-x-4">
            <p className="text-4xl">
              {formatWithUnit(dashboardData.areas.totalFloor, "m²")}
            </p>
            {dashboardData.areas.totalFloor > 0 && (
              <div className="space-y-1 text-gray-300">
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
        <Titled title="Space heating energy" subtitle="Estimated annual">
          <CircleChart
            data={[
              {
                value: energyUse.spaceHeatingDemandComparative,
                color: "#898989",
                description: "Space heating minimum regs",
              },
              {
                value: energyUse.spaceHeatingDemand,
                color: defaultColor,
                description: "Space heating for buildings",
              },
              {
                value: energyUse.spaceHeatingDemandNZEBComparative,
                color: "#ababab",
                description: "Space heating nZEB baseline",
              },
            ]}
            displayValue={energyUse.spaceHeatingDemand}
            unitOfMeasurement="kWh/year"
          />
          <div className="flex justify-end">
            <p className="text-4xl">
              {formatWithUnit(energyUse.totalHeatingCost, "€")}
            </p>
            <ChangeDataPoint
              value={energyUse.spaceHeatingDemand}
              reference={energyUse.spaceHeatingDemandComparative}
              description="Compared to minimum regs"
            />
            <ChangeDataPoint
              value={energyUse.spaceHeatingDemand}
              reference={energyUse.spaceHeatingDemandNZEBComparative}
              description="Compared to nZEB baseline"
            />
          </div>
        </Titled>
        <Titled title="Carbon emissions" subtitle="Estimated annual">
          <StackedBarChart
            data={[houseOperationalCo2, houseOperationalCo2Comparative]}
            unitOfMeasurement="t"
          />
          <div className="flex space-x-4">
            <p className="text-4xl">
              {formatWithUnit(
                dashboardData.operationalCo2.annualTotal / 1000,
                "tCO₂"
              )}
            </p>
            <ChangeDataPoint
              value={dashboardData.operationalCo2.annualTotal / 1000}
              reference={dashboardData.operationalCo2.annualComparative / 1000}
              description="Compared to nZEB baseline"
            />
          </div>
        </Titled>
      </GridLayout>
      <GridLayout>
        <Titled title="Embodied carbon" subtitle="Estimated upfront (A1-A3)">
          <StackedBarChart
            data={[houseEmbodiedCo2, houseEmbodiedCo2Comparative]}
            unitOfMeasurement="t"
          />
          {
            <div className="flex space-x-8">
              <p className="text-4xl">
                {formatWithUnit(dashboardData.embodiedCo2.total / 1000, "tCO₂")}
              </p>
              {dashboardData.embodiedCo2.total < 0 && (
                <p className="text-sm text-gray-300">
                  Project will remove carbon dioxide from the atmosphere
                </p>
              )}
            </div>
          }
        </Titled>
      </GridLayout>
    </div>
  )
}

export default OverviewTab
