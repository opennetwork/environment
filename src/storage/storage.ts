import {Store} from "./store/store"
import {getEnvironment, Environment, dispatchEvent} from "../environment/environment"
import {Event} from "../events/events";

export * from "./store/store"
export * from "./store/events"
export * from "./s3"
export * from "./json"

export interface StoreUpdateEvent extends Event<"store:update"> {
    store: Store
}

declare global {

    interface EnvironmentEvents {
        "store:update": StoreUpdateEvent
    }

}


const stores = new WeakMap<Environment, Store>()

export function getStore(): Store {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use Store")
    }
    let store = stores.get(environment)
    if (!store) {
        store = new Store()
        stores.set(environment, store)
    }
    return store
}

export async function setStore(store: Store) {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use Store")
    }
    if (stores.get(environment) === store) {
        return
    }
    stores.set(environment, store)
    await dispatchEvent({
        type: "store:update",
        store
    })
}
