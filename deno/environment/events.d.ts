import { Event, EventCallback, EventTarget } from "../events/events";
import { Environment } from "./environment";
export interface ConfigureEvent extends Event<"configure"> {
    environment: Environment;
}
export interface ExecuteEvent extends Event<"execute"> {
    environment: Environment;
}
export interface CompleteEvent extends Event<"complete"> {
    environment: Environment;
}
export interface ErrorEvent extends Event<"error"> {
    error: unknown;
}
declare global {
    interface EnvironmentEvents {
        configure: ConfigureEvent;
        execute: ExecuteEvent;
        complete: CompleteEvent;
        error: ErrorEvent;
    }
}
export interface EnvironmentEventTarget extends EventTarget {
    addEventListener(type: string, callback: EventCallback): void;
    addEventListener(type: "error", callback: EventCallback<ErrorEvent>): void;
}
export declare class EnvironmentEventTarget extends EventTarget implements EnvironmentEventTarget {
}
