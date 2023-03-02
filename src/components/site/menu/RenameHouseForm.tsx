import React from "react"
import { useForm } from "react-hook-form"

type Props = {
  currentName: string
  onNewName: (s: string) => void
}

const RenameHouseForm = (props: Props) => {
  const { currentName, onNewName, ...restProps } = props
  const { register, handleSubmit } = useForm()
  const onSubmit = ({ newName }: any) => {
    onNewName(newName)
  }

  console.log({ restProps })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" defaultValue={currentName} {...register("newName")} />
      <input type="submit" />
    </form>
  )
}

export default RenameHouseForm
