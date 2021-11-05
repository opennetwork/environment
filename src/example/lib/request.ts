import {Event} from "../../events/event/event";
import {addEventListener} from "../../environment/environment";
import {Request} from "@opennetwork/http-representation";

export interface RequestEventHandlerOptions {
    method?: string | RegExp;
    pathname?: string | RegExp;
}


function addUrl<O extends object, T extends URL>(event: O, url: T): asserts event is O & { url: T } {
    Object.defineProperty(event, "url", {
        value: url,
        writable: true,
        configurable: true,
        enumerable: true
    });
}

export function addRequestEventHandler<T extends "fetch" | "render", E extends Event<T>>(type: T, options: RequestEventHandlerOptions, fn: ((event: E) => Promise<void> | void)): void {
    addEventListener(type, async (event: E) => {
        const request = event.request;
        assertRequest(request);
        const { url, method } = request;
        const urlInstance = new URL(url, "https://fetch.spec.whatwg.org");
        const { pathname } = urlInstance
        if (options.method && (typeof options.method === "string" ? options.method !== method : !options.method.test(method))) return;
        if (options.pathname && (typeof options.pathname === "string" ? options.pathname !== pathname : !options.pathname.test(pathname))) return;
        addUrl(event, urlInstance);
        return fn(event);
    })
}

function isRequest(request: unknown): request is Request {
    function isRequestLike(request: unknown): request is { json: unknown, url: unknown } {
        return !!request;
    }
    return (
        isRequestLike(request) &&
        typeof request.url === "string" &&
        typeof request.json === "function"
    );
}

function assertRequest(request: unknown): asserts request is Request {
    if (!isRequest(request)) {
        throw new Error("Expected request");
    }
}
