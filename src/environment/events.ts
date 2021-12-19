import {Event, EventCallback, EventTarget, EventTargetAddListenerOptions} from "../events/events"
import { Environment } from "./environment"

export interface InstallEvent extends Event<"install"> {
    environment: Environment
}

export interface ConfigureEvent extends Event<"configure"> {
    environment: Environment
}

export interface ExecuteEvent extends Event<"execute"> {
    environment: Environment
}

export interface CompleteEvent extends Event<"complete"> {
    environment: Environment
}

export interface ErrorEvent extends Event<"error"> {
    error: unknown
}

declare global {

    interface EnvironmentEvents {
        install: InstallEvent
        configure: ConfigureEvent
        execute: ExecuteEvent
        complete: CompleteEvent
        error: ErrorEvent
    }

}

export interface EnvironmentEventTarget extends EventTarget {
    addEventListener(type: string, callback: EventCallback, options?: EventTargetAddListenerOptions): void
    addEventListener(type: "error", callback: EventCallback<ErrorEvent>, options?: EventTargetAddListenerOptions): void
}

export class EnvironmentEventTarget extends EventTarget implements EnvironmentEventTarget {

}
