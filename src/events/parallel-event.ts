import { Event, isEvent } from "./event/event"

export interface ParallelEvent<Name extends string = string> extends Event<Name> {
    parallel: true | undefined
}

export function isParallelEvent(value: object): value is ParallelEvent {
    return isEvent(value) && value.parallel !== false
}
