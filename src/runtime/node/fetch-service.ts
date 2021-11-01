import { getPort } from "./service"
import { createServer, IncomingMessage, ServerResponse } from "http"
import {
    dispatchEvent,
    addEventListener,
    hasEventListener
} from "../../environment/environment"
import { fromRequest, sendResponse } from "@opennetwork/http-representation-node"
import { Request, Response } from "@opennetwork/http-representation"
import { getRuntimeEnvironment } from "../environment"
import { runWithSpan, trace, error as traceError } from "../../tracing/span"
import AbortController from "abort-controller"
import { defer } from "../../deferred"
import { isSignalHandled, Event } from "../../events/events"
import { hasFlag } from "../../flags/flags"
import { getEnvironmentConfig, setEnvironmentConfig } from "../../config/config"
import {dispatchFetchEvent} from "../../fetch/fetch";
import * as http from "http";

export interface FetchEvent extends Event<"fetch"> {
    request: Request
    respondWith(response: Response | Promise<Response>): void
    waitUntil(promise: Promise<unknown>): Promise<void>
}

declare global {

    interface EnvironmentEvents {
        fetch: FetchEvent
    }

}

export interface FetchServiceConfig {
    port: number
    onListener?: boolean
    baseUrl?: string
    timeout?: number | boolean
}

addEventListener("configure", async () => {
    const config = getEnvironmentConfig()

    if (config.fetchService) {
        return
    }

    const port = getPort("FETCH_SERVICE_PORT")

    if (!port) {
        return
    }

    let baseUrl = process.env.FETCH_SERVICE_BASE_URL

    if (!baseUrl) {
        baseUrl = "https://fetch.spec.whatwg.org"
    }

    await setEnvironmentConfig({
        ...config,
        fetchService: {
            port,
            baseUrl,
            onListener: hasFlag("FETCH_SERVICE_ON_LISTENER"),
            timeout: hasFlag("FETCH_SERVICE_ABORT_ON_TIMEOUT")
        }
    })
})

export async function start(): Promise<void> {
    const config = getEnvironmentConfig()

    if (!config.fetchService) {
        return
    }

    const { port, onListener, timeout: abortTimeout, baseUrl } = config.fetchService

    if (onListener) {
        const hasListeners = await hasEventListener("fetch")

        if (!hasListeners) {
            // No need to configure, no one is going to hears
            return
        }
    }

    const server = createServer(onRequestResponsePair)

    await new Promise<void>(
        (resolve, reject) => {
            server.once("error", reject)
            server.listen(port, () => {
                server.removeListener("error", reject)
                resolve()
            })
        }
    )

    addEventListener("complete", close)

    return new Promise(
        resolve => server.once("close", resolve)
    )

    function onRequestResponsePair(request: IncomingMessage, response: ServerResponse) {
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
            environment.addAbortController(controller)
            request.on("abort", () => controller.abort());
            request.on("close", () => controller.abort());
            const [event, responsePromise] = await dispatchFetchEvent({
                request: httpRequest,
                abortTimeout,
                signal: controller.signal,
                type: "fetch"
            });
            try {
                const httpResponse = await responsePromise;
                trace("response", {
                    "http.status": httpResponse.status
                })
                await sendResponse(httpResponse, httpRequest, response)
                trace("request_end")
            } finally {
                abort("finally")
                // Ensure the promise is completed if it is still in play
                event.respondWith(
                    Promise.reject(new Error("Response no longer required"))
                );
            }

            function abort(reason?: string) {
                if (controller.signal.aborted) {
                    // Already aborted, no need to do it again!
                    return
                }
                if (reason) {
                    trace("signal_aborted", {
                        reason
                    })
                }
                controller.abort()
            }
        }
    }

    async function close() {
        return new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
}
