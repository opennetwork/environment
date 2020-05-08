export interface Event<Name extends string = string> {
    type: Name
    [key: string]: unknown
    [key: number]: unknown
}

export interface ParallelEvent<Name extends string = string> extends Event<Name> {
    parallel: true
}

export function isEvent(value: object): value is Event {
    return value.hasOwnProperty("type")
}

export function isParallelEvent(value: object): value is ParallelEvent {
    return isEvent(value) && value.parallel === true
}