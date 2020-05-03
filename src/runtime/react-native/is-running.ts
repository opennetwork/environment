export function isRunningReactNative() {
    return typeof navigator !== "undefined" && navigator.product === "ReactNative"
}
