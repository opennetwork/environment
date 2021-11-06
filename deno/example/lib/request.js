import { addEventListener } from "../../environment/environment.js";
export function isUrlEvent(event) {
    function isUrlEventLike(event) {
        return !!event;
    }
    return isUrlEventLike(event) && event.url instanceof URL;
}
export function assertOrDefineRequestEventUrl(event, url) {
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
export function assertRequestEventUrl(event) {
    if (!isUrlEvent(event)) {
        throw new Error("Expected url");
    }
}
export function addRequestEventHandler(type, options, fn) {
    addEventListener(type, async (event) => {
        const request = event.request;
        if (!isRequest(request))
            return;
        const url = new URL(request.url, "https://fetch.spec.whatwg.org");
        if (!isMatch(request, options, "method"))
            return;
        if (!isMatch(url, options, "href"))
            return;
        if (!isMatch(url, options, "protocol"))
            return;
        if (!isMatch(url, options, "host"))
            return;
        if (!isMatch(url, options, "hostname"))
            return;
        if (!isMatch(url, options, "origin"))
            return;
        if (!isMatch(url, options, "port"))
            return;
        if (!isMatch(url, options, "hash"))
            return;
        if (!isMatch(url, options, "username"))
            return;
        if (!isMatch(url, options, "password"))
            return;
        if (!isMatch(url, options, "pathname"))
            return;
        if (!isMatch(url, options, "search"))
            return;
        if (!isSearchParamsMatch(url, options))
            return;
        assertOrDefineRequestEventUrl(event, url);
        return fn(event);
    });
    function isSearchParamsMatch(object, options) {
        const option = options.searchParams;
        if (!option)
            return true;
        if (typeof option === "function")
            return !!option(object.searchParams);
        throw new Error("Unexpected request matcher");
    }
    function isMatch(object, options, key) {
        const option = options[key];
        if (!option)
            return true;
        if (typeof option === "string")
            return option === object[key];
        if (typeof option === "function")
            return !!option(object[key]);
        if (option instanceof RegExp)
            return option.test(object[key]);
        throw new Error("Unexpected request matcher");
    }
}
function isRequest(request) {
    function isRequestLike(request) {
        return !!request;
    }
    return (isRequestLike(request) &&
        typeof request.url === "string" &&
        typeof request.json === "function");
}
