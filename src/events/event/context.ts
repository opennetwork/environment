import {Environment, getEnvironment, getOptionalEnvironment} from "../../environment/environment"
import {Event} from "./event"
import {EventDescriptor} from "./descriptor"

export interface DispatchedEvent {
    descriptor?: EventDescriptor
    event: Event
    target: unknown
    timestamp: number
}

export interface EventListener {
    isListening(): boolean
    descriptor: EventDescriptor
    timestamp: number
}

export interface EventContext {
    dispatcher: Event | undefined
    listeners: EventListener[]
    dispatchedEvents: DispatchedEvent[]
}

const globalEventContext = new WeakMap<Environment, WeakMap<Event, EventContext>>()

export function hasEventContext(event: Event) {
    const environment = getOptionalEnvironment()
    if (!environment) {
        return false
    }
    const environmentEventContext = globalEventContext.get(environment)
    if (!environmentEventContext) {
        return false
    }
    return environmentEventContext.has(event)
}

export function getEventContext(event: Event) {
    const environment = getEnvironment()
    let environmentEventContext = globalEventContext.get(environment)

    if (!environmentEventContext) {
        environmentEventContext = new WeakMap()
        globalEventContext.set(environment, environmentEventContext)
    }

    let eventContext = environmentEventContext.get(event)

    if (!eventContext) {
        eventContext = {
            dispatcher: undefined,
            dispatchedEvents: [],
            listeners: []
        }
        environmentEventContext.set(event, eventContext)
    }

    return eventContext
}

