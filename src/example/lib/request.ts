import {Event} from "../../events/event/event";
import {addEventListener} from "../../environment/environment";
import {Request} from "@opennetwork/http-representation";

export interface RequestEventHandlerOptions {
    method?: string | RegExp;
    pathname?: string | RegExp;
}


export function isUrlEvent<O extends object>(event: O): event is O & { url: URL } {
    function isUrlEventLike(event: unknown): event is O & { url: unknown } {
        return !!event;
    }
    return isUrlEventLike(event) && event.url instanceof URL;
}

export function assertOrDefineRequestEventUrl<O extends object, T extends URL>(event: O, url: T): asserts event is O & { url: T } {
    if (isUrlEvent(event)) {
        if (url.toString() !== url.toString()) {
            throw new Error("url found already on event, but it does not match the provided url");
        }
        return;
    }
    Object.defineProperty(event, "url", {
        value: url,
        writable: true,
        configurable: true,
        enumerable: true
    });
    assertRequestEventUrl(event);
}

export function assertRequestEventUrl<O extends object>(event: O): asserts event is O & { url: URL } {
    if (!isUrlEvent(event)) {
        throw new Error("Expected url");
    }
}

export function addRequestEventHandler<T extends string, E extends Event<T>>(type: T, options: RequestEventHandlerOptions, fn: ((event: E) => Promise<void> | void)): void {
    addEventListener(type, async (event: E) => {
        const request = event.request;
        assertRequest(request);
        const { url, method } = request;
        const urlInstance = new URL(url, "https://fetch.spec.whatwg.org");
        const { pathname } = urlInstance
        if (options.method && (typeof options.method === "string" ? options.method !== method : !options.method.test(method))) return;
        if (options.pathname && (typeof options.pathname === "string" ? options.pathname !== pathname : !options.pathname.test(pathname))) return;
        assertOrDefineRequestEventUrl(event, urlInstance);
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
