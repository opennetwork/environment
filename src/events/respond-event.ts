import {Event} from "./event/event"
import {InvalidStateError} from "../errors/errors"

export interface RespondEvent<Name extends string = string, T = unknown> extends Event<Name> {
    /**
     * @param value
     * @throws InvalidStateError
     */
    respondWith(value: T | Promise<T>): void
}