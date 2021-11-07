import { createLocalStorage } from "../../local-storage.js";
import { getEnvironment } from "../../environment/environment.js";
import { getEventContext } from "./context.js";
const localStorage = createLocalStorage();
export async function runWithEvent(event, callback) {
    return localStorage.run(event, callback);
}
const TopLevelEvent = Object.freeze({
    type: "top"
});
export function getEvent() {
    const environment = getEnvironment();
    if (!environment) {
        return TopLevelEvent;
    }
    return localStorage.getStore() || TopLevelEvent;
}
export function getDispatcherEvents(event = getEvent()) {
    if (!event) {
        return [];
    }
    const eventContext = getEventContext(event);
    if (!eventContext.dispatcher) {
        return [];
    }
    return [
        eventContext.dispatcher
    ]
        .concat(getDispatcherEvents(eventContext.dispatcher));
}
