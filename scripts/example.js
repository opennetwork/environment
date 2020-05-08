import {
  addEventListener,
  ExecuteEventType,
  ConfigureEventType,
  dispatchEvent,
  getEnvironmentContext,
  getEventContext,
  CompleteEventType,
  getTracer,
  createFlag,
  setEventFlag,
  setFlag,
  hasFlag
} from "../esnext/index.js"
import { Response } from "@opennetwork/http-representation"

// addEventListener("*", function (event) {
//   console.log({ wildcardEvent: event })
// })

// addEventListener("fetch", function (event) {
//   event.respondWith(new Response("Hello !", {
//     status: 200,
//     headers: {}
//   }))
// })

addEventListener("Custom event!", async function(event) {
  console.log(event, getEnvironmentContext())

  await dispatchEvent({ type: "Some other event" })
})

addEventListener(ConfigureEventType, async function configure(event) {
  createFlag("FLAG")
  createFlag("FLAG_NON_INHERITING", false)

  setEventFlag(event, "FLAG_NON_INHERITING")
  setFlag("FLAG")

  console.log({
    FLAG: hasFlag("FLAG"),
    FLAG_NON_INHERITING: hasFlag("FLAG_NON_INHERITING")
  })

  addEventListener("child event", function () {
    console.log({
      FLAG: hasFlag("FLAG"),
      FLAG_NON_INHERITING: hasFlag("FLAG_NON_INHERITING")
    })
  })

  await dispatchEvent({ type: "child event" })

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

  console.log({
    FLAG: hasFlag("FLAG"),
    FLAG_NON_INHERITING: hasFlag("FLAG_NON_INHERITING")
  })

})

function dispatchMap(event) {
  const context = getEventContext(event)

  return {
    event,
    context,
    children: context.dispatchedEvents.map(({ event }) => dispatchMap(event))
  }
}

export default import("../esnext/runtime/run.js")
  .then(({ default: promise }) => promise)
