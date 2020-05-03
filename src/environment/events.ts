import {Event, EventCallback, EventTarget} from "../events/events"
import {Environment} from "./environment";

export const EnvironmentEventNamespace = "@opennetwork/environment"

export const ConfigureEventType = "@opennetwork/environment/configure"
export interface ConfigureEvent extends Event<typeof ConfigureEventType> {
    environment: Environment
}

export const ExecuteEventType = "@opennetwork/environment/execute"
export interface ExecuteEvent extends Event<typeof ExecuteEventType> {
    environment: Environment
}

export type EnvironmentEvent =
    | ExecuteEvent

export const EnvironmentEvents: EnvironmentEvent["type"][] = [
    ExecuteEventType
]

export function isEnvironmentEvent(value: Event): value is EnvironmentEvent {
    const events: string[] = EnvironmentEvents
    return events.includes(value.type)
}

export interface EnvironmentEventTarget extends EventTarget {
    addEventListener(type: string, callback: EventCallback): void
    addEventListener(type: typeof ExecuteEventType, callback: EventCallback<ExecuteEvent>): void
}

export class EnvironmentEventTarget extends EventTarget implements EnvironmentEventTarget {

}
