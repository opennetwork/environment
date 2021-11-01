export function isRunning() {
    return typeof navigator !== "undefined" && navigator.product === "ReactNative"
}
