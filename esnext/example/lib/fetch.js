import { addRequestEventHandler } from "./request.js";
export function addFetchEventListener(options, fn) {
    addRequestEventHandler("fetch", options, fn);
}
