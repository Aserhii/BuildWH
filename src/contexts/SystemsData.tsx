import { useSystemId } from "@/stores/context"
import { filterA, mapR } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { Fragment, ReactNode } from "react"
import { SystemsData, useSystemsData } from "../data/system"
import { createCtx } from "./utils"

const [useCtx, CtxProvider, ctx] = createCtx<SystemsData>()

export { useCtx as useSystemsData }

export const SystemsDataContext = ctx

type SystemsDataProviderProps = {
  children?: ReactNode
  onLoading?: ReactNode
  onError?: ReactNode
}

export const SystemsDataProvider = ({
  children,
  onLoading = null,
  onError = null,
}: SystemsDataProviderProps) => {
  const systemsData = useSystemsData()
  if (!systemsData) return <Fragment>{onLoading}</Fragment>
  if (systemsData === "error") return <Fragment>{onError}</Fragment>
  return <CtxProvider value={systemsData}>{children}</CtxProvider>
}

export const useSystemData = (systemId?: string) => {
  const selectedBuildingId = useSystemId()

  const systemsData = useCtx() as unknown as {
    [key: string]: Array<{ systemId: string }>
  }

  if (!systemId && typeof selectedBuildingId !== "string")
    throw new Error(
      "useSystemData called without a building selected and without a system ID"
    )

  return pipe(
    systemsData,
    mapR(
      filterA(
        (v: { systemId: string }) =>
          v.systemId === (systemId ?? selectedBuildingId)
      )
    )
  ) as unknown as SystemsData
}
