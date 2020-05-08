import { getTracer } from "./tracer"
import { createLocalStorage } from "../local-storage"
import OpenTracing from "opentracing"

const localStorage = createLocalStorage<OpenTracing.Span>()

export async function runWithSpan(name: string, options: OpenTracing.SpanOptions, callback: () => void | Promise<void>) {
    const tracer = getTracer()
    const parent = getSpan()
    if (parent && options.references) {
        options = {
            ...options,
            references: [
                OpenTracing.childOf(parent.context())
            ]
        }
    }
    const span = tracer.startSpan(name, options)
    try {
        await localStorage.run(span, callback)
        trace({ event: "success" }, undefined, span)
    } catch (e) {
        error(e, undefined, span)
        throw e
    } finally {
        span.finish()
    }
    return span
}

export function getSpan() {
    return localStorage.getStore()
}

export function trace(keyValuePairs: { [key: string]: any }, timestamp?: number, span: OpenTracing.Span | undefined = getSpan()) {
    if (span) {
        span.log(keyValuePairs, timestamp)
    }
}

export function error(error: Error, timestamp?: number, span: OpenTracing.Span | undefined = getSpan()) {
    if (span) {
        span.setTag(OpenTracing.Tags.ERROR, true)
        span.log({
            event: "error",
            "error.object": error,
            "message": error.message,
            "stack": error.stack
        })
    }
}
