import { HouseType } from "@/data/houseType"
import { Module } from "@/data/module"
import { useDebug } from "@/stores/debug"
import { reduceRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import { filterMapWithIndex } from "fp-ts/lib/ReadonlyArray"
import { useControls } from "leva"
import React, { Fragment, Suspense, useEffect, useState } from "react"
import ModuleDebugModule from "./ModuleDebugModule"

const ModuleDebug = () => {
  const houseTypeModules = useDebug()

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
                  <ModuleDebugModule module={module} />
                </Suspense>
              )
            : none
        )
      )}
    </Fragment>
  )
}

export default ModuleDebug
