import { useSystemsData } from "@/contexts/SystemsData"
import { HouseType } from "@/data/houseType"
import { Module } from "@/data/module"
import { mapRA, reduceRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { groupBy } from "fp-ts/lib/NonEmptyArray"
import { none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  findFirst,
} from "fp-ts/lib/ReadonlyArray"
import { useControls } from "leva"
import { Fragment, Suspense, useEffect, useState } from "react"
import DebugModule from "./DebugModule"

const DebugHouseType = () => {
  const { houseTypes, modules: allModules } = useSystemsData()

  const houseTypeModules = pipe(
    houseTypes,
    mapRA((houseType) =>
      pipe(
        houseType.dna,
        filterMap((strand) =>
          pipe(
            allModules,
            findFirst(
              (module) =>
                module.systemId === houseType.systemId && module.dna === strand
            )
          )
        ),
        (modules) => ({ houseType, modules })
      )
    )
  )

  const [maxModuleIndex, setMaxModuleIndex] = useState(0)

  const { selection, moduleIndex } = useControls(
    {
      selection: {
        options: pipe(
          houseTypeModules,
          reduceRA({}, (b, { houseType, modules }) => ({
            ...b,
            [houseType.name]: { houseType, modules },
          }))
        ),
      },
      moduleIndex: {
        value: 0,
        min: 0,
        max: maxModuleIndex,
        step: 1,
      },
    },
    [maxModuleIndex]
  ) as {
    selection: { houseType: HouseType; modules: Module[] }
    moduleIndex: number
  }

  useEffect(
    () => setMaxModuleIndex(selection.modules.length - 1),
    [selection.modules.length]
  )

  useEffect(() => {
    console.log(selection.modules[moduleIndex].dna)
  }, [moduleIndex])

  const { modules } = selection

  return (
    <Fragment>
      {pipe(
        modules,
        filterMapWithIndex((i, module) =>
          i === moduleIndex
            ? some(
                <Suspense key={i} fallback={null}>
                  <DebugModule module={module} />
                </Suspense>
              )
            : none
        )
      )}
    </Fragment>
  )
}

export default DebugHouseType
