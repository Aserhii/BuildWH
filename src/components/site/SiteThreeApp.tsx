import { store } from "@/store"
import { pipe } from "fp-ts/lib/function"
import { map } from "fp-ts/lib/ReadonlyArray"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense, useEffect } from "react"
import { useSnapshot } from "valtio"
import { House } from "../house"
import Loader3D from "../ui-3d/Loader3D"

const SiteThreeApp = () => {
  const { houses } = useSnapshot(store)

  return (
    <group>
      {pipe(
        houses,
        keys,
        map((id) => (
          <Suspense key={id} fallback={<Loader3D />}>
            <House id={id} />
          </Suspense>
        ))
      )}
    </group>
  )
}

export default SiteThreeApp
