import {Event, EventCallback, EventTarget} from "../events/events"
import {Environment} from "./environment"
import {Request, Response} from "@opennetwork/http-representation"

export const EnvironmentEventNamespace = "@opennetwork/environment"

export const FetchEventType = "fetch"
export interface FetchEvent extends Event<typeof FetchEventType> {
    request: Request
    respondWith(response: Response): void
    waitUntil(promise: Promise<unknown>): Promise<void>
}

export const ConfigureEventType = "@opennetwork/environment/configure"
export interface ConfigureEvent extends Event<typeof ConfigureEventType> {
    environment: Environment
}

export const ExecuteEventType = "@opennetwork/environment/execute"
export interface ExecuteEvent extends Event<typeof ExecuteEventType> {
    environment: Environment
}

export const CompleteEventType = "@opennetwork/environment/complete"
export interface CompleteEvent extends Event<typeof CompleteEventType> {
    environment: Environment
}

export const ErrorEventType = "error"
export interface ErrorEvent extends Event<typeof ErrorEventType> {
    error: Error
}

export type EnvironmentEvent =
    | ConfigureEvent
    | ExecuteEvent
    | CompleteEvent
    | ErrorEvent
    | FetchEvent

export const EnvironmentEvents: EnvironmentEvent["type"][] = [
    ExecuteEventType,
    ConfigureEventType,
    FetchEventType,
    CompleteEventType,
    ErrorEventType
]

export function isEnvironmentEvent(value: Event): value is EnvironmentEvent {
    const events: string[] = EnvironmentEvents
    return events.includes(value.type)
}

export interface EnvironmentEventTarget extends EventTarget {
    addEventListener(type: string, callback: EventCallback): void
    addEventListener(type: "end", callback: EventCallback<Event>): void
    addEventListener(type: typeof ErrorEventType, callback: EventCallback<ErrorEvent>): void
}

export class EnvironmentEventTarget extends EventTarget implements EnvironmentEventTarget {

}
