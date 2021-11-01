export function isRunning() {
    return typeof addEventListener !== "undefined"  && typeof fetch !== "undefined" && typeof Deno !== "undefined";
}
