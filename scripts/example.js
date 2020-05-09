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
  setFlag,
  hasFlag,
  resetFlag,
  removeFlag,
  isSignalEvent,
  isRespondEvent
} from "../esnext/index.js"
import { Response } from "@opennetwork/http-representation"
import AbortController from "abort-controller";

// addEventListener("*", function (event) {
//   console.log({ wildcardEvent: event })
// })

addEventListener("fetch", async function (event) {
  const response = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => {
        console.log("Fetch Responding")
        resolve(new Response("Hello !", {
          status: 200,
          headers: {}
        }))

      },
      // Simulate request time here, if FETCH_SERVICE_ABORT_ON_TIMEOUT=true then timeout will be 30 seconds by defaults
      1000
    )
    event.signal.addEventListener("abort", () => {
      console.log("Fetch Responder aborted")
      clearTimeout(timeout)
      const error = new Error()
      error.name = "AbortError"
      reject(error)
    })
  })
  event.respondWith(response)
  return response
})

addEventListener("Aborting only event", async function(event) {
  if (isSignalEvent(event)) {
    console.log("Waiting to abort! I'm gonna do it!")
    await new Promise(resolve => event.signal.addEventListener("abort", resolve))
    console.log("Was told to abort!")
  } else {
    console.log("Did not receive a signal, aborting!!!!", event, isSignalEvent(event))
  }
  const error = new Error()
  error.name = "AbortError"
  throw error
})

addEventListener("Aborting only event", async function (event) {
  if (isSignalEvent(event) && isRespondEvent(event)) {
    console.log("I lied! I will try and respond in time!")
    const response = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("Responding")
        resolve("42")
      }, 20)
      event.signal.addEventListener("abort", () => {
        console.log("Lier aborted")
        clearTimeout(timeout)
        const error = new Error()
        error.name = "AbortError"
        reject(error)
      })
    })
    event.respondWith(response)
  } else {
    console.log("Did not receive a signal or respond event, aborting!!!!")
    const error = new Error()
    error.name = "AbortError"
    throw error
  }
})

addEventListener("Custom event!", async function(event) {
  console.log(event, getEnvironmentContext())

  const { resolve: withResponse, reject: withResponseError, promise: responded } = (() => {
    let resolve, reject
    const promise = new Promise((resolveFn, rejectFn) => {
      resolve = resolveFn
      reject = rejectFn
    })
    return { resolve, reject, promise }
  })()

  const controller = new AbortController()

  const customEvent = {
    type: "Aborting only event",
    respondWith(value) {
      new Promise(
        (resolve, reject) => {
          Promise.resolve(value)
            .then(resolve)
            .catch(error => {
              if (error instanceof Error && error.name === "AbortError") {
                // Ignore
                return
              }
              reject(error)
            })
        }
      )
        .then(withResponse, withResponseError)
    },
    signal: controller.signal,
    parallel: true
  }

  const results = await Promise.allSettled([
    dispatchEvent(customEvent),
    new Promise(resolve => {
      const timeout = setTimeout(() => {
        if (!controller.signal.aborted) {
          console.log("Aborting")
          controller.abort()
          resolve("Aborted, timeout")
        }
      }, 200)
      responded.then(immediate, immediate)
      function immediate() {
        clearTimeout(timeout)
        console.log("Aborting, response given")
        controller.abort()
        resolve("Aborted, response given")
      }
    })
  ])
  console.log(results)

  await dispatchEvent({ type: "Some other event" })
})

addEventListener(ConfigureEventType, async function configure(event) {
  createFlag("FLAG")

  setFlag("FLAG")

  console.log({
    FLAG: hasFlag("FLAG")
  })

  addEventListener("child event", function () {

    console.log({
      FLAG: hasFlag("FLAG")
    })
  })

  await dispatchEvent({ type: "child event" })

  resetFlag("FLAG")
  console.log({
    FLAG: hasFlag("FLAG")
  })
  createFlag("FLAG")

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
    FLAG: hasFlag("FLAG")
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
