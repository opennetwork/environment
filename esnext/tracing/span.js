import { getTracer } from "./tracer.js";
import { createLocalStorage } from "../local-storage.js";
import { getEnvironment } from "../environment/environment.js";
const localStorage = createLocalStorage();
export async function runWithSpanOptional(name, options, callback) {
    const environment = getEnvironment();
    if (!environment) {
        return callback();
    }
    return runWithSpan(name, options, callback);
}
export async function runWithSpan(name, options, callback) {
    const tracer = getTracer();
    const parent = getSpan();
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
        };
    }
    const span = tracer.startSpan(name, options);
    try {
        await localStorage.run(span, callback);
        trace("success", {}, undefined, span);
    }
    catch (e) {
        error(e, undefined, span);
        throw e;
    }
    finally {
        span.end();
    }
    return span;
}
export function getSpan() {
    return localStorage.getStore();
}
export function trace(name, keyValuePairs = {}, timestamp, span = getSpan()) {
    if (span) {
        span.addEvent(name, keyValuePairs, timestamp);
    }
}
export function error(error, timestamp, span = getSpan()) {
    if (span) {
        if (error instanceof Error) {
            span.addEvent("error", {
                "error.object": JSON.stringify(error),
                "message": error.message,
                "stack": error.stack
            }, timestamp);
        }
        else {
            span.addEvent("error", {
                "error.object": JSON.stringify(error),
                "message": String(error)
            }, timestamp);
        }
    }
}
