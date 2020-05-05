import { addEventListener, ExecuteEventType, ConfigureEventType, getEnvironment, getEnvironmentContext } from "../esnext/index.js"

addEventListener("*", function (event) {
  console.log({ wildcardEvent: event })
})

addEventListener("Custom event!", function(event) {
  console.log(event)
})

addEventListener(ConfigureEventType, async function configure(event) {
  console.log(event)
})

addEventListener(ExecuteEventType, async function handler(event) {
  console.log(`We are running in ${event.environment.name}`)
  console.log({ context: this })
  console.log({ context: getEnvironmentContext() })

  console.log({ environment: getEnvironment() })

  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log({ environmentAfterTimeout: getEnvironment() })

  await new Promise(resolve => setTimeout(() => {
    console.log({ environmentInTimeout: getEnvironment() })
    resolve()
  }, 1000))

})

export default import("../esnext/runtime/run.js")
  .then(({ default: promise }) => promise)
  .then(() => console.log({ environmentAfterRun: getEnvironment() }))
