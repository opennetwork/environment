import {Response as AnyResponse, Request, RequestInfo} from "@opennetwork/http-representation";
import {dispatchEvent, Environment, getEnvironment, hasEventListener} from "../environment/environment";
import {FetchEvent} from "./event";
import AbortController from "abort-controller";
import {defer} from "../deferred";
import {trace} from "../tracing/span";
import {globalFetch} from "./global";

export async function fetch(url: string, init?: RequestInit): Promise<AnyResponse | Response> {
    let type: "fetch" | "external-fetch" | "internal-fetch" = "fetch";
    if (url.startsWith("https://") || url.startsWith("http://")) {
        if (await hasEventListener("external-fetch")) {
            type = "external-fetch";
        } else if (!globalFetch) {
            throw new Error("Not Implemented");
        }
    } else {
        if (await hasEventListener("internal-fetch")) {
            type = "internal-fetch";
        }
    }
    if (!(await hasEventListener(type))) {
        if (globalFetch) {
            return globalFetch(url, init);
        }
        throw new Error("Not Implemented");
    }
    const request = new Request(new URL(url, 'https://fetch.spec.whatwg.org').toString(), init);
    const [, response] = await dispatchFetchEvent({
      request,
      type
    });
    try {
        return await response;
    } catch (error) {
        return new AnyResponse(`${error}`, {
            status: 500
        });
    }
}

export interface FetchEventInit<T extends string> {
    request: Request;
    abortTimeout?: number | boolean;
    signal?: AbortSignal;
    type: T;
    environment?: Environment
}

export async function dispatchFetchEvent<T extends string>({
    request: httpRequest,
    abortTimeout,
    signal: externalSignal,
    type,
    environment: externalEnvironment
}: FetchEventInit<T>): Promise<[FetchEvent<T>, Promise<AnyResponse>]> {
    const environment = externalEnvironment ?? getEnvironment();
    const controller = new AbortController()
    environment.addAbortController(controller)
    const { resolve: respondWith, reject: respondWithError, promise: responded } = defer<AnyResponse>()
    const event: FetchEvent<T> = {
        type,
        request: httpRequest,
        respondWith(httpResponse: AnyResponse | Promise<AnyResponse>): void {
            environment.addService(
                Promise.resolve(httpResponse)
                    .then(respondWith)
                    .catch(respondWithError)
            )
        },
        async waitUntil(promise: Promise<unknown>): Promise<void> {
            environment.addService(promise)
            await promise
        },
        parallel: false,
        signal: controller.signal,
        environment
    }
    let timeout: unknown
    try {
        externalSignal?.addEventListener("aborted", () => abort("request_aborted"))
        environment.addService(
            responded.then(
                () => abort("responded"),
                () => abort("responded_with_error")
            )
        )
        if (abortTimeout) {
            timeout = setTimeout(() => {
                abort("timed_out")
                respondWith(new AnyResponse("", {
                    status: 408
                }))
            }, typeof abortTimeout === "number" ? abortTimeout : 30000)
        }
        try {
            await environment.runInAsyncScope(async () => {
                await dispatchEvent(event);
            })
        } catch (error) {
            respondWith(new AnyResponse(`${error}`, {
                status: 500
            }));
        }
        return [event, responded];
    } finally {
        environment.addService(responded)
        environment.addService(
            responded.finally(() => {
                if (typeof timeout === "number") {
                    clearTimeout(timeout)
                }
            })
        )
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
        controller.abort()
    }
}
