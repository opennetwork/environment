import { getEnvironment } from "./environment.js";
export const EnvironmentContextSymbol = Symbol("Environment Context");
export function createEnvironmentContext() {
    return {
        type: EnvironmentContextSymbol
    };
}
const globalEnvironmentContext = new WeakMap();
export function getEnvironmentContext(environment = getEnvironment()) {
    if (!environment) {
        throw new Error("Environment required for EnvironmentContext");
    }
    let environmentEventContext = globalEnvironmentContext.get(environment);
    if (!environmentEventContext) {
        environmentEventContext = createEnvironmentContext();
        globalEnvironmentContext.set(environment, environmentEventContext);
    }
    return environmentEventContext;
}
