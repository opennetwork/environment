import {Event} from "../../events/event/event";
import {addEventListener} from "../../environment/environment";
import {Request} from "@opennetwork/http-representation";

export interface RequestEventMatcherFn<T> {
    (value: T): boolean
}
export type RequestEventMatcher = string | RegExp | RequestEventMatcherFn<string>;

export interface RequestEventHandlerOptions {
    method?: RequestEventMatcher;
    // URL string values
    hash?: RequestEventMatcher;
    host?: RequestEventMatcher;
    hostname?: RequestEventMatcher;
    href?: RequestEventMatcher;
    origin?: RequestEventMatcher;
    password?: RequestEventMatcher;
    pathname?: RequestEventMatcher;
    port?: RequestEventMatcher;
    protocol?: RequestEventMatcher;
    search?: RequestEventMatcher;
    searchParams?: RequestEventMatcherFn<URLSearchParams>;
    username?: RequestEventMatcher;
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
        if (!isRequest(request)) return;
        const url = new URL(request.url, "https://fetch.spec.whatwg.org");
        if (!isMatch(request, options, "method")) return;
        if (!isMatch(url, options, "href")) return;
        if (!isMatch(url, options, "protocol")) return;
        if (!isMatch(url, options, "host")) return;
        if (!isMatch(url, options, "hostname")) return;
        if (!isMatch(url, options, "origin")) return;
        if (!isMatch(url, options, "port")) return;
        if (!isMatch(url, options, "hash")) return;
        if (!isMatch(url, options, "username")) return;
        if (!isMatch(url, options, "password")) return;
        if (!isMatch(url, options, "pathname")) return;
        if (!isMatch(url, options, "search")) return;
        if (!isSearchParamsMatch(url, options)) return;
        assertOrDefineRequestEventUrl(event, url);
        return fn(event);
    })

    function isSearchParamsMatch(object: { searchParams: URLSearchParams }, options: { searchParams?: RequestEventMatcherFn<URLSearchParams> }) {
        const option = options.searchParams;
        if (!option) return true;
        if (typeof option === "function") return !!option(object.searchParams);
        throw new Error("Unexpected request matcher");
    }

    function isMatch<K extends string, O extends Record<K, string>>(object: O, options: Partial<Record<K, string | RegExp | ((value: string) => boolean)>>, key: K) {
        const option = options[key];
        if (!option) return true;
        if (typeof option === "string") return option === object[key];
        if (typeof option === "function") return !!option(object[key]);
        if (option instanceof RegExp) return option.test(object[key]);
        throw new Error("Unexpected request matcher");
    }
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
