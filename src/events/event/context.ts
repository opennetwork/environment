import {Environment, getEnvironment} from "../../environment/environment"
import {Event} from "./event"
import {EventDescriptor} from "./descriptor"

export interface DispatchedEvent {
    descriptor?: EventDescriptor
    event: Event
    target: unknown
}

export interface EventContext {
    dispatchedEvents: DispatchedEvent[]
}

const globalEventContext = new WeakMap<Environment, WeakMap<Event, EventContext>>()

export function getEventContext(event: Event) {

    const environment = getEnvironment()

    if (!environment) {
        throw new Error("Environment required for EventContext")
    }

    let environmentEventContext = globalEventContext.get(environment)

    if (!environmentEventContext) {
        environmentEventContext = new WeakMap()
        globalEventContext.set(environment, environmentEventContext)
    }

    let eventContext = environmentEventContext.get(event)

    if (!eventContext) {
        eventContext = {
            dispatchedEvents: []
        }
        environmentEventContext.set(event, eventContext)
    }

    return eventContext
}

