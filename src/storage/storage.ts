import {Store} from "./store/store"
import {getEnvironment, Environment, dispatchEvent} from "../environment/environment"
import {Event} from "../events/events";

export * from "./store/store"
export * from "./store/routed"
export * from "./store/events"
export * from "./store/typed"
export * from "./s3"
export * from "./json"
export * from "./fetch"

export interface StoreUpdateEvent extends Event<"store:update"> {
    store: Store
}

declare global {

    interface EnvironmentEvents {
        "store:update": StoreUpdateEvent
    }

}
