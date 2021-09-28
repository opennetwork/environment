import {Store} from "./store/store"
import {getEnvironment, Environment, dispatchEvent} from "../environment/environment"
import {Event} from "../events/events";

export * from "./store/store"
export * from "./store/routed"
export * from "./store/events"
export * from "./store/typed"
export * from "./store/entries";
export * from "./s3"
export * from "./json"
export * from "./fetch"
export * from "./fs";
export * from "./browser";

export interface StoreUpdateEvent extends Event<"store:update"> {
    store: Store
}

declare global {

    interface EnvironmentEvents {
        "store:update": StoreUpdateEvent
    }

}
