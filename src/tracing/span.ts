import { getTracer } from "./tracer"
import { createLocalStorage } from "../local-storage"
import { Span, SpanOptions, SpanAttributes } from "@opentelemetry/api"
import { getEnvironment } from "../environment/environment";

const localStorage = createLocalStorage<Span>()

export async function runWithSpanOptional(name: string, options: SpanOptions, callback: () => void | Promise<void>) {
    const environment = getEnvironment()
    if (!environment) {
        return callback()
    }
    return runWithSpan(name, options, callback)
}

export async function runWithSpan(name: string, options: SpanOptions, callback: () => void | Promise<void>) {
    const tracer = getTracer()
    const parent = getSpan()
    if (parent && !options.links) {
        options = {
            ...options,
            links: [
                {
                    attributes: {
                      is: "parent"
                    },
                    context: parent.spanContext(),
                }
            ]
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

export function trace(name: string, keyValuePairs: SpanAttributes = {}, timestamp?: number, span: Span | undefined = getSpan()) {
    if (span) {
        span.addEvent(name, keyValuePairs, timestamp)
    }
}

export function error(error: unknown, timestamp?: number, span: Span | undefined = getSpan()) {
    if (span) {
        if (error instanceof Error) {
            span.addEvent("error", {
                "error.object": JSON.stringify(error),
                "message": error.message,
                "stack": error.stack
            }, timestamp)
        } else {
            span.addEvent("error", {
                "error.object": JSON.stringify(error),
                "message": String(error)
            }, timestamp)
        }
    }
}
