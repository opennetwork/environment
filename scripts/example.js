import { addEventListener, ExecuteEventType, ConfigureEventType, getEnvironment } from "../esnext/index.js"

addEventListener("Custom event!", function(event) {
  console.log(event)
})

addEventListener(ConfigureEventType, async function configure(event) {
  console.log(event)
})

addEventListener(ExecuteEventType, async function handler(event) {
  console.log(`We are running in ${event.environment.name}`)
  console.log({ context: this })
  const currentIdentity = await this.identity.get("current")
  console.log({ currentIdentity })

  const environment = getEnvironment()
  console.log({ environment })

  await new Promise(resolve => setTimeout(resolve, 1000))

  const environmentAfterTimeout = getEnvironment()
  console.log({ environmentAfterTimeout })

  await new Promise(resolve => setTimeout(() => {
    const environmentInTimeout = getEnvironment()
    console.log({ environmentInTimeout })
    resolve()
  }, 1000))

})

export default import("../esnext/runtime/run.js")
  .then(({ default: promise }) => promise)
  .then(() => console.log({ environmentAfterRun: getEnvironment() }))
