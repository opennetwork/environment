const that = globalThis ?? this;

export function isRunning() {
    return "addEventListener" in that && "crypto" in that && "caches" in that && "HTMLRewriter" in that && "Headers" in that && "Response" in that && "Request" in that;
}
