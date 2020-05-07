import { addEventListener, ExecuteEventType, ConfigureEventType, getEnvironment, getEnvironmentContext } from "../esnext/index.js"
import { Response } from "@opennetwork/http-representation"

// addEventListener("*", function (event) {
//   console.log({ wildcardEvent: event })
// })

addEventListener("fetch", function (event) {
  console.log(console.request)
  event.respondWith(new Response("Hello!", {
    headers: {
      "Content-Type": "text/plain"
    }
  }))
})

addEventListener("Custom event!", function(event) {
  console.log(event)
})

addEventListener(ConfigureEventType, async function configure(event) {
  console.log(event)

  const context = getEnvironmentContext()
  if (context) {
    context["identity"] = {
      _id: "1"
    }
  }
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
