import { Event } from "./event/event";
export interface RespondEvent<Name extends string = string, T = unknown> extends Event<Name> {
    /**
     * @param value
     * @throws InvalidStateError
     */
    respondWith(value: T | Promise<T>): void;
}
export declare function isRespondEvent<T = unknown>(value: object): value is RespondEvent<string, T>;
