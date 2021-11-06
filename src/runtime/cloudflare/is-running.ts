declare global {
    const HTMLRewriter: unknown;
}

export function isRunning() {
    return typeof addEventListener !== "undefined"  && typeof caches !== "undefined" && typeof HTMLRewriter !== "undefined" && typeof document === "undefined";
}
