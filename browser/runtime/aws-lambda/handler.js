import { run } from "../runner.js";
import { dispatchFetchEvent } from "../../fetch/fetch.js";
import { Request } from "https://cdn.skypack.dev/@opennetwork/http-representation";
import AbortController from "https://cdn.skypack.dev/abort-controller";
import { defer } from "../../deferred.js";
export async function handlerAPIGateway(event) {
    const controller = new AbortController();
    const { resolve, promise } = defer();
    await run({
        event,
        AWS_LAMBDA: true,
        async execute() {
            const url = new URL(event.path, `${event.requestContext.protocol}://${event.requestContext.domainName}`);
            const request = new Request(url.toString(), {
                method: event.httpMethod,
                body: event.body,
                headers: Object.fromEntries(Object.entries(event.headers ?? {}).filter(([key, value]) => typeof value === "string" || Array.isArray(value)))
            });
            const [, responsePromise] = await dispatchFetchEvent({
                request,
                abortTimeout: 300000,
                signal: controller.signal,
                type: "fetch",
            });
            const response = await responsePromise;
            resolve({
                statusCode: response.status,
                body: await response.text(),
                headers: {
                    ...Object.fromEntries(response.headers.entries())
                }
            });
        }
    });
    return await promise;
}
function isEventLike(event) {
    return !!event;
}
function isAPIGatewayEvent(event) {
    return !!(isEventLike(event) && event.requestContext && event.httpMethod && event.path);
}
export async function handler(event) {
    if (isAPIGatewayEvent(event)) {
        return handlerAPIGateway(event);
    }
    throw new Error("Unknown AWS Lambda event type");
}
