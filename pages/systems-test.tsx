import { systemsData, useInitSystemsData } from "@/stores/system"

// todo
//
// - minimal test with fetch and suspense
// - with r3f

const SystemsTest = () => {
  const loaded = useInitSystemsData()

  return !loaded ? (
    "loading"
  ) : (
    <div>
      <pre>{JSON.stringify(systemsData, null, 2)}</pre>
    </div>
  )
}

export default SystemsTest
