import React, { Fragment, ReactNode } from "react"
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
