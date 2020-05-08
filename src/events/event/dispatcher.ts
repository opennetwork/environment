import { Event } from "./event"
import { createLocalStorage } from "../../local-storage"
import { getEnvironment } from "../../environment/environment"
import { getEventContext } from "./context"

const localStorage = createLocalStorage<Event>()

export async function runWithEvent(event: Event, callback: () => void | Promise<void>) {
    return localStorage.run(event, callback)
}

export function getEvent() {
    const environment = getEnvironment()
    if (!environment) {
        return undefined
    }
    return localStorage.getStore()
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
