import { getPort } from "./service"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { dispatchEvent, addEventListener, CompleteEventType, FetchEvent, FetchEventType } from "../../environment/environment"
import { fromRequest, sendResponse } from "@opennetwork/http-representation-node"
import { Response } from "@opennetwork/http-representation"

export async function start() {
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

    return close

    function onRequestResponsePair(request: IncomingMessage, response: ServerResponse) {
        const httpRequest = fromRequest(
            request,
            process.env.FETCH_SERVICE_BASE_URL
        )

        const event: FetchEvent = {
            type: FetchEventType,
            request: httpRequest,
            respondWith(httpResponse: Response): void {
                sendResponse(httpResponse, httpRequest, response)
                    .then(() => {
                        // Done
                    })
                    .catch((error: unknown) => {
                        // Error
                        console.warn(error)
                    })
            },
            async waitUntil(promise: Promise<unknown>): Promise<void> {
                // Do nothing with it for now
                await promise
            }
        }

        dispatchEvent(event)
            .catch((error: unknown) => {
                // Error
                console.warn(error)
            })

    }

    async function close() {
        console.log("Close service")
        return new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
}
