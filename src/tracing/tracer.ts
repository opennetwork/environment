import { Environment, getEnvironment } from "../environment/environment"
import OpenTracing from "opentracing"

const tracers = new WeakMap<Environment, OpenTracing.Tracer>()

export function getTracer() {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use Tracer")
    }
    let tracer = tracers.get(environment)
    if (!tracer) {
        // TODO create tracer implementation
        tracer = new OpenTracing.Tracer()
        tracers.set(environment, tracer)
    }
    return tracer
}
