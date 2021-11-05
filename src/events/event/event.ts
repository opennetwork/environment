import {Environment} from "../../environment/environment";

export interface Event<Name extends string = string> {
    type: Name
    parallel?: boolean
    signal?: {
        aborted: boolean
    }
    environment?: Environment
    [key: string]: unknown
    [key: number]: unknown
}

export function isEvent(value: object): value is Event {
    return value.hasOwnProperty("type")
}
