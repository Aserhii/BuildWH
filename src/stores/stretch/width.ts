import { useSystemData } from "@/contexts/SystemsData"
import {
  filterCompatibleModules,
  StructuredDnaModule,
  topCandidateByHamming,
} from "@/data/module"
import { SectionType } from "@/data/sectionType"
import {
  ColumnLayout,
  columnLayoutToDNA,
  GridGroup,
  PositionedColumn,
  PositionedModule,
} from "@/hooks/layouts"
import { useGetVanillaModule } from "@/hooks/modules"
import {
  filterA,
  filterMapA,
  flattenO,
  mapO,
  mapToOption,
  notNullish,
  NumOrd,
  reduceA,
  reduceToOption,
} from "@/utils"
import { Foldable, isNonEmpty, replicate, sort } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { head, NonEmptyArray } from "fp-ts/lib/NonEmptyArray"
import { none, Option, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { last } from "fp-ts/lib/ReadonlyNonEmptyArray"
import { fromFoldable, keys } from "fp-ts/lib/Record"
import { first } from "fp-ts/lib/Semigroup"
import { useMemo, useState } from "react"
import houses from "../houses"

const { abs, sign } = Math

export const useStretchWidth = (id: string, columnLayout: ColumnLayout) => {
  const { sectionTypes, modules: systemModules } = useSystemData()

  const getVanillaModule = useGetVanillaModule()

  const module0 = columnLayout[0].gridGroups[0].modules[0].module

  const { current, options } = pipe(
    sectionTypes,
    reduceA(
      { current: null, options: [] },
      (
        {
          current,
          options,
        }: { current: SectionType | null; options: SectionType[] },
        st
      ) =>
        st.code === module0.structuredDna.sectionType
          ? {
              current: st,
              options,
            }
          : {
              current,
              options: [...options, st],
            }
    ),
    ({ current, options }) => ({
      current: pipe(current, notNullish("current sectionType nullish")),
      options,
    })
  )

  const dnaChangeOptions = pipe(
    [current, ...options],
    filterMapA((st) =>
      pipe(
        columnLayout,
        mapToOption(
          ({ gridGroups, ...columnRest }): Option<PositionedColumn> =>
            pipe(
              gridGroups,
              mapToOption(
                ({ modules, ...gridGroupRest }): Option<GridGroup> => {
                  const vanillaModule = pipe(
                    getVanillaModule(modules[0].module, {
                      sectionType: st.code,
                    }),
                    toNullable
                  )

                  if (vanillaModule === null) return none

                  return pipe(
                    modules,
                    reduceToOption(
                      some([]),
                      (
                        _i,
                        acc: Option<PositionedModule[]>,
                        { module, z }: PositionedModule
                      ): Option<PositionedModule[]> => {
                        const target: StructuredDnaModule = {
                          structuredDna: {
                            ...module.structuredDna,
                            sectionType: st.code,
                          },
                        }
                        const compatModules = pipe(
                          systemModules,
                          filterCompatibleModules()(target)
                        )
                        if (compatModules.length === 0) return none

                        return pipe(
                          compatModules,
                          topCandidateByHamming(target),
                          mapO((bestModule) => {
                            const distanceToTarget =
                              target.structuredDna.gridUnits -
                              bestModule.structuredDna.gridUnits
                            switch (true) {
                              case sign(distanceToTarget) > 0:
                                // fill in some vanilla
                                return [
                                  bestModule,
                                  ...replicate(
                                    distanceToTarget / vanillaModule.length,
                                    vanillaModule
                                  ),
                                ]
                              case sign(distanceToTarget) < 0:
                                // abort and only vanilla
                                return replicate(
                                  module.length / vanillaModule.length,
                                  vanillaModule
                                )

                              case sign(distanceToTarget) === 0:
                              default:
                                return [bestModule]
                              // swap the module
                            }
                          }),
                          mapO((nextModules) =>
                            pipe(
                              acc,
                              mapO((positionedModules) => [
                                ...positionedModules,
                                ...nextModules.map(
                                  (module) =>
                                    ({
                                      module,
                                      z,
                                    } as PositionedModule)
                                ),
                              ])
                            )
                          ),
                          flattenO
                        )
                      }
                    ),
                    mapO(
                      (modules): GridGroup => ({
                        ...gridGroupRest,
                        modules,
                      })
                    )
                  )
                }
              ),
              mapO((gridGroups) => ({
                ...columnRest,
                gridGroups,
              }))
            )
        ),
        mapO((columnLayout): [string, string[]] => [
          st.code,
          columnLayoutToDNA(columnLayout as ColumnLayout),
        ])
      )
    ),
    fromFoldable(first<string[]>(), Foldable)
  )

  const canStretchWidth = true // todo

  const sortedSTs: NonEmptyArray<SectionType> = pipe(
    sectionTypes,
    filterA((st) => keys(dnaChangeOptions).includes(st.code)),
    sort(
      pipe(
        NumOrd,
        contramap((st: SectionType) => st.width)
      )
    ),
    (sts) => {
      if (!isNonEmpty(sts)) throw new Error("Empty section types")
      return sts
    }
  )

  const maxWidth = pipe(sortedSTs, last, (x) => x.width)

  const minWidth = pipe(sortedSTs, head, (x) => x.width)

  const [stIndex, setSTIndex] = useState(-1)

  const gateLineX = useMemo(() => {
    if (stIndex === -1) return current.width / 2
    return sortedSTs[stIndex].width / 2
  }, [stIndex])

  const sendWidthDrag = (x: number) => {
    const absX = abs(x)

    let distance = Infinity,
      index = -1

    for (let i = 0; i < sortedSTs.length; i++) {
      const st = sortedSTs[i]
      const d = abs(st.width / 2 - absX)
      if (d < distance) {
        distance = d
        index = i
      }
    }

    setSTIndex(index)
  }

  const sendWidthDrop = () => {
    const st = sortedSTs[stIndex]
    const dnaChange = dnaChangeOptions[st.code]
    if (dnaChange !== houses[id].dna) houses[id].dna = dnaChange
  }

  return {
    canStretchWidth,
    minWidth,
    maxWidth,
    gateLineX,
    sendWidthDrag,
    sendWidthDrop,
  }
}
