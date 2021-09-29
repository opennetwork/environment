import {Store} from "./store/store";
import {Event} from "../events/events";

export * from "./store/store"
export * from "./store/routed"
export * from "./store/events"
export * from "./store/typed"
export * from "./store/entries";
export * from "./store/typed-context";
export {
    StorageKeyPrefix,
    StorageKeyPrefixUnknown
} from "./store/prefixed-key";
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
