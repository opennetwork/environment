import { getEnvironment } from "../../environment/environment.js";
const globalEventContext = new WeakMap();
export function hasEventContext(event) {
    const environment = getEnvironment();
    if (!environment) {
        return false;
    }
    const environmentEventContext = globalEventContext.get(environment);
    if (!environmentEventContext) {
        return false;
    }
    return environmentEventContext.has(event);
}
export function getEventContext(event) {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required for EventContext");
    }
    let environmentEventContext = globalEventContext.get(environment);
    if (!environmentEventContext) {
        environmentEventContext = new WeakMap();
        globalEventContext.set(environment, environmentEventContext);
    }
    let eventContext = environmentEventContext.get(event);
    if (!eventContext) {
        eventContext = {
            dispatcher: undefined,
            dispatchedEvents: [],
            listeners: []
        };
        environmentEventContext.set(event, eventContext);
    }
    return eventContext;
}
