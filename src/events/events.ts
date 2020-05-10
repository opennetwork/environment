import { Event } from "./event/event";

export * from "./event/event"
export * from "./event/context"
export * from "./event/dispatcher"
export * from "./event/descriptor"
export * from "./target/target"
export * from "./parallel-event"
export * from "./signal-event"
export * from "./respond-event"

declare global {

    interface EnvironmentEvents {
        [key: string]: Event
    }

}

export {
    EnvironmentEvents
}

export type EnvironmentEventTypes = EnvironmentEvents[keyof EnvironmentEvents]["type"]
