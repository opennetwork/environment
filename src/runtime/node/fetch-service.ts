import { getPort } from "./service"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { dispatchEvent, addEventListener, CompleteEventType, FetchEvent, FetchEventType } from "../../environment/environment"
import { fromRequest, sendResponse } from "@opennetwork/http-representation-node"
import { Response } from "@opennetwork/http-representation"
import { getRuntimeEnvironment } from "../environment"
import { runWithSpan, trace, error } from "../../tracing/span"

export async function start(): Promise<void> {
    const port = getPort("FETCH_SERVICE_PORT")
    if (!port) {
        return
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

        runWithSpan("request", {}, run).catch(() => {
            if (response.writableEnded) {
                return
            }
            response.writeHead(500)
            response.end()
        })

        async function run() {

            const environment = await getRuntimeEnvironment()

            const httpRequest = fromRequest(
                request,
                baseUrl
            )

            trace({
                "http.url": httpRequest.url,
                "http.method": httpRequest.method
            })

            const event: FetchEvent = {
                type: FetchEventType,
                request: httpRequest,
                respondWith(httpResponse: Response): void {
                    trace({
                        "http.status": httpResponse.status
                    })
                    environment.addService(
                        sendResponse(httpResponse, httpRequest, response)
                            .then(() => {
                                // Done
                                trace({
                                    event: "request_end"
                                })
                            })
                            .catch(error)
                    )
                },
                async waitUntil(promise: Promise<unknown>): Promise<void> {
                    environment.addService(promise)
                    await promise
                }
            }

            await environment.runInAsyncScope(async () => {
                await dispatchEvent(event)
            })
        }
    }

    async function close() {
        console.log("Close service")
        return new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
}
