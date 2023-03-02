import React, { Fragment, ReactNode } from "react"
import { BuildSystemsData, useSystemsData } from "../data/buildSystem"
import { createCtx } from "./utils"

const [useCtx, CtxProvider, ctx] = createCtx<BuildSystemsData>()

export { useCtx as useBuildSystemsData }

export const BuildSystemsDataContext = ctx

type BuildSystemsDataProviderProps = {
  children?: ReactNode
  onLoading?: ReactNode
  onError?: ReactNode
}

export const BuildSystemsDataProvider = ({
  children,
  onLoading = null,
  onError = null,
}: BuildSystemsDataProviderProps) => {
  const systemsData = useSystemsData()
  if (!systemsData) return <Fragment>{onLoading}</Fragment>
  if (systemsData === "error") return <Fragment>{onError}</Fragment>
  return <CtxProvider value={systemsData}>{children}</CtxProvider>
}
