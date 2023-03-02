import { proxy } from "valtio"

type StretchProxy = {
  previewDna: string[]
}

const scratch = proxy<StretchProxy>({
  previewDna: [],
})

export default scratch
