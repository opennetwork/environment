import { addEventListener, ExecuteEventType, ConfigureEventType, dispatchEvent, getEnvironmentContext, getEventContext } from "../esnext/index.js"
import { Response } from "@opennetwork/http-representation"

// addEventListener("*", function (event) {
//   console.log({ wildcardEvent: event })
// })

addEventListener("fetch", function (event) {
  throw new Error("Hello!")
  console.log(event.request)
  event.respondWith(new Response("Hello!", {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  }))
})

addEventListener("Custom event!", async function(event) {
  console.log(event, getEnvironmentContext())

  await dispatchEvent({ type: "Some other event" })
})

addEventListener(ConfigureEventType, async function configure(event) {
  const context = getEnvironmentContext()
  if (context) {
    context["identity"] = {
      _id: "1"
    }
  }
})

addEventListener(ExecuteEventType, async function handler(event) {
  console.log({ context: getEnvironmentContext() })
  await dispatchEvent({ type: "Custom event!" })

  console.log(JSON.stringify(dispatchMap(event)))

})

function dispatchMap(event) {
  const context = getEventContext(event)

  return {
    event,
    children: context.dispatchedEvents.map(({ event }) => dispatchMap(event))
  }
}

export default import("../esnext/runtime/run.js")
  .then(({ default: promise }) => promise)
