import { getPort } from "./service"
import { createServer, IncomingMessage, ServerResponse, STATUS_CODES } from "http"
import { dispatchEvent, addEventListener, CompleteEventType, FetchEvent, FetchEventType } from "../../environment/environment"
import { fromRequest, sendResponse } from "@opennetwork/http-representation-node"
import { Response } from "@opennetwork/http-representation"
import { getRuntimeEnvironment } from "../environment"

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

        run().catch(error => {
            const errorId = Math.random().toString().replace(/[^\d]/g, "")
            const date = new Date().toUTCString()
            console.warn(date, errorId, error)
            if (response.writableEnded) {
                return
            }
            response.writeHead(500, {
                Warning: `199 - "${errorId}" "${date}"`
            })
            response.end()
        })

        async function run() {

            const environment = await getRuntimeEnvironment()

            const httpRequest = fromRequest(
                request,
                baseUrl
            )

            const event: FetchEvent = {
                type: FetchEventType,
                request: httpRequest,
                respondWith(httpResponse: Response): void {
                    environment.addService(
                        sendResponse(httpResponse, httpRequest, response)
                            .then(() => {
                                // Done
                            })
                            .catch((error: unknown) => {
                                // Error
                                console.warn(error)
                            })
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
