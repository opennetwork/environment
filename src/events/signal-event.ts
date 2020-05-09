import { Event, isEvent } from "./event/event"
import { SyncEventTarget } from "./target/target"
import {SyncEventCallback} from "./event/callback";

export interface AbortSignal extends SyncEventTarget {
    aborted: boolean
    addEventListener(type: "abort", callback: SyncEventCallback): void
    addEventListener(type: string, callback: SyncEventCallback): void
}

export interface SignalEvent<Name extends string = string> extends Event<Name> {
    signal: AbortSignal
}

export function isSignalEvent(value: object): value is SignalEvent {
    function isSignalEventLike(value: object): value is { signal?: unknown } {
        return value.hasOwnProperty("signal")
    }
    function isAbortSignal(value: unknown): value is AbortSignal {
        function isAbortSignalLike(value: unknown): value is Partial<Record<keyof AbortSignal, unknown>> {
            return typeof value === "object"
        }
        return (
            isAbortSignalLike(value) &&
            typeof value.aborted === "boolean" &&
            typeof value.addEventListener === "function"
        )
    }
    return (
        isEvent(value) &&
        isSignalEventLike(value) &&
        isAbortSignal(value.signal)
    )
}