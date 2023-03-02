import { useSystemsData } from "@/contexts/SystemsData"
import { systems } from "@/data/system"
import { StrEq, StrOrd } from "@/utils"
import { filterMap, findFirstMap, sort, uniq } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { none, some, toNullable } from "fp-ts/lib/Option"
import { useControls } from "leva"
import { Fragment, Suspense } from "react"
import DebugIfcModule from "./DebugIfcModule"
import DebugModule from "./DebugModule"

const DebugSystem = () => {
  const { modules: allModules } = useSystemsData()

  const { system, ifc } = useControls({
    system: {
      options: systems.map((x) => x.id),
      value: systems[0].id,
    },
    ifc: false,
  }) as {
    system: string
    ifc: boolean
  }

  const moduleOptions = pipe(
    allModules,
    filterMap((module) =>
      module.systemId === system ? some(module.dna) : none
    ),
    uniq(StrEq),
    sort(StrOrd)
  )

  const { moduleDna } = useControls(
    {
      moduleDna: {
        options: moduleOptions,
        value: moduleOptions[0],
      },
    },
    [system]
  )

  return (
    <Fragment>
      {pipe(
        allModules,
        findFirstMap((module) =>
          module.systemId === system && module.dna === moduleDna
            ? some(
                <Suspense key={moduleDna} fallback={null}>
                  {ifc ? (
                    !module.ifcUrl || module.ifcUrl.length === 0 ? null : (
                      <DebugIfcModule module={module} />
                    )
                  ) : (
                    <DebugModule module={module} />
                  )}
                </Suspense>
              )
            : none
        ),
        toNullable
      )}
    </Fragment>
  )
}

export default DebugSystem
