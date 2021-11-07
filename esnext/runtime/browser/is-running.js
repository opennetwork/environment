import { isRunning as isRunningDeno } from "../deno/is-running.js";
export function isRunning() {
    return typeof localStorage !== "undefined" && typeof addEventListener !== "undefined" && !isRunningDeno();
}
export function isRunningServiceWorker() {
    return isRunning() && typeof caches !== "undefined";
}
