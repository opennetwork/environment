import { isEvent } from "./event/event.js";
export function isRespondEvent(value) {
    function isRespondEventLike(value) {
        return isEvent(value);
    }
    return (isRespondEventLike(value) &&
        typeof value.respondWith === "function");
}
