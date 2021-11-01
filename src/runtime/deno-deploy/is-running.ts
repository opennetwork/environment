const that = globalThis ?? this;

export function isRunning() {
    return "addEventListener" in that && "fetch" in that && "crypto" in that && "Deno" in that && "BroadcastChannel" in that && "Headers" in that && "Response" in that && "Request" in that;
}
