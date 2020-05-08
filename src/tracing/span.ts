import { getTracer } from "./tracer"
import { createLocalStorage } from "../local-storage"
import { Span, SpanOptions, Attributes } from "@opentelemetry/api"

const localStorage = createLocalStorage<Span>()

export async function runWithSpan(name: string, options: SpanOptions, callback: () => void | Promise<void>) {
    const tracer = getTracer()
    const parent = getSpan()
    if (parent && !options.parent) {
        options = {
            ...options,
            parent
        }
    }
    const span = tracer.startSpan(name, options)
    try {
        await localStorage.run(span, callback)
        trace("success", {}, undefined, span)
    } catch (e) {
        error(e, undefined, span)
        throw e
    } finally {
        span.end()
    }
    return span
}

export function getSpan() {
    return localStorage.getStore()
}

export function trace(name: string, keyValuePairs: Attributes = {}, timestamp?: number, span: Span | undefined = getSpan()) {
    if (span) {
        span.addEvent(name, keyValuePairs, timestamp)
    }
}

export function error(error: Error, timestamp?: number, span: Span | undefined = getSpan()) {
    if (span) {
        span.addEvent("error", {
            "error.object": error,
            "message": error.message,
            "stack": error.stack
        }, timestamp)
    }
}
