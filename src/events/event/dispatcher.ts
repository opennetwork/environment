import { Event } from "./event"
import { createLocalStorage } from "../../local-storage"
import { getOptionalEnvironment } from "../../environment/environment"
import { getEventContext } from "./context"

const localStorage = createLocalStorage<Event>()

export async function runWithEvent(event: Event, callback: () => void | Promise<void>) {
    return localStorage.run(event, callback)
}

const TopLevelEvent: Event = Object.freeze({
    type: "top"
})

export function getEvent() {
    const environment = getOptionalEnvironment()
    if (!environment) {
        return TopLevelEvent
    }
    return localStorage.getStore() || TopLevelEvent
}

export function getDispatcherEvents(event: Event | undefined = getEvent()): Event[] {
    if (!event) {
        return []
    }
    const eventContext = getEventContext(event)
    if (!eventContext.dispatcher) {
        return []
    }
    return [
        eventContext.dispatcher
    ]
        .concat(
            getDispatcherEvents(eventContext.dispatcher)
        )
}
