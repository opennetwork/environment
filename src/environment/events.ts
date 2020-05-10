import {Event, EventCallback, EventTarget} from "../events/events"
import {Environment} from "./environment"
import {RenderFunction} from "../render/render-function"

export const EnvironmentEventNamespace = "@opennetwork/environment"

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

export const RenderEventType = "render"
export interface RenderEvent extends Event<typeof RenderEventType> {
    render(fn: RenderFunction): Promise<void>
}

export interface EnvironmentEventTarget extends EventTarget {
    addEventListener(type: string, callback: EventCallback): void
    addEventListener(type: "end", callback: EventCallback<Event>): void
    addEventListener(type: typeof ErrorEventType, callback: EventCallback<ErrorEvent>): void
}

export class EnvironmentEventTarget extends EventTarget implements EnvironmentEventTarget {

}
