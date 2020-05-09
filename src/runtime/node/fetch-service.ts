import { getPort } from "./service"
import { createServer, IncomingMessage, ServerResponse } from "http"
import {
    dispatchEvent,
    addEventListener,
    CompleteEventType,
    FetchEvent,
    FetchEventType,
    hasEventListener
} from "../../environment/environment"
import { fromRequest, sendResponse } from "@opennetwork/http-representation-node"
import { Response } from "@opennetwork/http-representation"
import { getRuntimeEnvironment } from "../environment"
import { runWithSpan, trace, error as traceError } from "../../tracing/span"
import AbortController from "abort-controller"
import { defer } from "../../deferred"
import {isSignalEvent, isSignalHandled} from "../../events/events"
import { hasFlag } from "../../flags/flags"

export async function start(): Promise<void> {
    const port = getPort("FETCH_SERVICE_PORT")
    if (!port) {
        return
    }

    if (hasFlag("FETCH_SERVICE_ON_LISTENER")) {
        const hasListeners = await hasEventListener(FetchEventType)

        if (!hasListeners) {
            // No need to configure, no one is going to hears
            return
        }
    }

    const server = createServer(onRequestResponsePair)

    await new Promise(
        (resolve, reject) => {
            server.once("error", reject)
            server.listen(port, () => {
                server.removeListener("error", reject)
                resolve()
            })
        }
    )

    addEventListener(CompleteEventType, close)

    return new Promise(
        resolve => server.once("close", resolve)
    )

    function onRequestResponsePair(request: IncomingMessage, response: ServerResponse) {

        let baseUrl = process.env.FETCH_SERVICE_BASE_URL

        if (!baseUrl) {
            baseUrl = "https://fetch.spec.whatwg.org"
        }

        const httpRequest = fromRequest(
            request,
            baseUrl
        )

        const attributes = {
            "http.url": httpRequest.url,
            "http.method": httpRequest.method
        }

        runWithSpan("request", { attributes }, run).catch(error => {
            traceError(error)
            if (response.writableEnded) {
                return
            }
            response.writeHead(500)
            response.end()
        })

        async function run() {

            const environment = await getRuntimeEnvironment()

            const controller = new AbortController()

            const { resolve: respondWith, reject: respondWithError, promise: responded } = defer<Response>()

            responded.catch(error => console.log("First caught", { error }))

            const event: FetchEvent = {
                type: FetchEventType,
                request: httpRequest,
                respondWith(httpResponse: Response | Promise<Response>): void {
                    environment.addService(
                        Promise.resolve(httpResponse)
                            .then(respondWith)
                            .catch(error => {
                                console.log("Catching in main catcher", error, isSignalHandled(event, error))
                                if (isSignalHandled(event, error)) {
                                    return
                                }
                                respondWithError(error)
                            })
                            .catch(error => {
                                console.log("Uncaught error here!!!", { error })
                            })
                    )
                },
                async waitUntil(promise: Promise<unknown>): Promise<void> {
                    environment.addService(promise)
                    await promise
                },
                parallel: false,
                signal: controller.signal
            }

            let timeout: unknown

            try {
                request.on("aborted", () => abort("request_aborted"))
                // We will abort on close to indicate to handlers that we can no longer accept a response
                request.on("close", () => abort("request_closed"))

                const danglingPromise = responded.then(
                    () => abort("responded"),
                    () => abort("responded_with_error")
                )

                if (hasFlag("FETCH_SERVICE_ABORT_ON_TIMEOUT")) {
                    timeout = setTimeout(() => {
                        console.log("timeout")
                        abort("timed_out")
                        respondWith(new Response("", {
                            status: 408
                        }))
                    }, 1000)
                }

                await environment.runInAsyncScope(async () => {
                    await dispatchEvent(event)
                })

                await danglingPromise

                const httpResponse = await responded

                if (typeof timeout === "number") {
                    clearTimeout(timeout)
                }

                trace("response", {
                    "http.status": httpResponse.status
                })

                await sendResponse(httpResponse, httpRequest, response)

                trace("request_end")
            } catch(e) {
                console.log("Caught here???", e)
            } finally {

                await responded

                abort("finally")
            }

            function abort(reason?: string) {
                if (typeof timeout === "number") {
                    clearTimeout(timeout)
                }

                if (controller.signal.aborted) {
                    // Already aborted, no need to do it again!
                    return
                }
                if (reason) {
                    trace("signal_aborted", {
                        reason
                    })
                }

                try {
                    controller.abort()
                } catch (error) {
                    console.log("Weirder caught", { error })
                }
            }
        }
    }

    async function close() {
        console.log("Close service")
        return new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
}
