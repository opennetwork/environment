export function isAbortError(error) {
    return error.name === "AbortError";
}
