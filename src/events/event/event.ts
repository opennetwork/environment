export interface Event<Name extends string = string> {
    type: Name
    parallel?: boolean
    [key: string]: unknown
    [key: number]: unknown
}

export interface ParallelEvent<Name extends string = string> extends Event<Name> {
    parallel: true | undefined
}

export function isEvent(value: object): value is Event {
    return value.hasOwnProperty("type")
}

export function isParallelEvent(value: object): value is ParallelEvent {
    return isEvent(value) && value.parallel !== false
}