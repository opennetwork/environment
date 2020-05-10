import {Event, isEvent} from "./event/event"
import {InvalidStateError} from "../errors/errors"

export interface RespondEvent<Name extends string = string, T = unknown> extends Event<Name> {
    /**
     * @param value
     * @throws InvalidStateError
     */
    respondWith(value: T | Promise<T>): void
}

export function isRespondEvent<T = unknown>(value: object): value is RespondEvent<string, T> {
    function isRespondEventLike(value: object): value is Partial<Record<keyof RespondEvent, unknown>> {
        return isEvent(value)
    }
    return (
        isRespondEventLike(value) &&
        typeof value.respondWith === "function"
    )
}
