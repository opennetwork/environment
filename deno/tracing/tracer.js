import { getEnvironment } from "../environment/environment.js";
import api from "https://cdn.skypack.dev/@opentelemetry/api";
const tracers = new WeakMap();
export function getTracer() {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use Tracer");
    }
    let tracer = tracers.get(environment);
    if (!tracer) {
        // TODO create tracer implementation
        tracer = api.trace.getTracer("@opennetwork/environment");
        tracers.set(environment, tracer);
    }
    return tracer;
}
