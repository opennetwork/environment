import { isEvent } from "./event/event.js";
export function isAbortSignal(value) {
    function isAbortSignalLike(value) {
        return typeof value === "object";
    }
    return (isAbortSignalLike(value) &&
        typeof value.aborted === "boolean" &&
        typeof value.addEventListener === "function");
}
export function isAbortController(value) {
    function isAbortControllerLike(value) {
        return typeof value === "object";
    }
    return (isAbortControllerLike(value) &&
        typeof value.abort === "function" &&
        isAbortSignal(value.signal));
}
export function isSignalEvent(value) {
    function isSignalEventLike(value) {
        return value.hasOwnProperty("signal");
    }
    return (isEvent(value) &&
        isSignalEventLike(value) &&
        isAbortSignal(value.signal));
}
