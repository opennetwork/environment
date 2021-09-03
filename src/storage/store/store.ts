import {EventTarget} from "../../events/events"
import {
    CreatedEvent,
    CreatedEventType,
    CreatingEvent,
    CreatingEventType,
    DeletedEvent,
    DeletedEventType,
    DeletingEvent,
    DeletingEventType,
    UpdatedEvent,
    UpdatedEventType,
    UpdatingEvent,
    UpdatingEventType
} from "./events"
import {StoreKey} from "./key"
import {dispatchEvent, Environment, getEnvironment} from "../../environment/environment";

export interface SyncStore<Key extends StoreKey = StoreKey, Value = unknown> {
    get(key: Key): Value | undefined
    set(key: Key, value: Value): void
    delete(key: Key): boolean
    has(key: Key): boolean
    entries?(): Iterable<[Key, Value]>
    keys(): Iterable<Key>
    values?(): Iterable<Value>
}

export interface AsyncStore<Key extends StoreKey = StoreKey, Value = unknown> {
    get(key: Key): Promise<Value | undefined>
    set(key: Key, value: Value): Promise<void>
    delete(key: Key): Promise<void>
    has(key: Key): Promise<boolean>
    entries?(): AsyncIterable<[Key, Value]>
    keys(): AsyncIterable<Key>
    values?(): AsyncIterable<Value>
}

export interface Store<Key extends StoreKey = StoreKey, Value = unknown> extends AsyncStore<Key, Value>, AsyncIterable<[Key, Value]> {
    ["__key"]: Key
    ["__value"]: Value
    entries(): AsyncIterable<[Key, Value]>
    values(): AsyncIterable<Value>
}

export class Store<Key extends StoreKey = StoreKey, Value = unknown> extends EventTarget implements Store<Key, Value> {

    readonly #base: AsyncStore<Key, Value> | SyncStore<Key, Value> | undefined

    constructor(base?: AsyncStore<Key, Value> | SyncStore<Key, Value> | Map<Key, Value>) {
        super()
        this.#base = base
    }

    async get(key: Key): Promise<Value | undefined> {
        if (!this.#base) {
            return undefined
        }
        return this.#base.get(key)
    }

    async set(key: Key, value: Value) {
        if (!this.#base) {
            return undefined
        }
        // Setting to undefined or null is same as deletion
        if (typeof value === "undefined" || value === null) {
            return this.delete(key)
        }
        const [isCreatingEvent, isCreatedEvent, isUpdatingEvent, isUpdatedEvent] = await Promise.all([
            this.hasEventListener(CreatingEventType),
            this.hasEventListener(CreatedEventType),
            this.hasEventListener(UpdatingEventType),
            this.hasEventListener(UpdatedEventType)
        ])
        let hasPreviousValue: boolean | undefined
        let previousValue: Value | undefined
        if (isCreatingEvent || isCreatedEvent) {
            hasPreviousValue = await this.has(key)
        }
        if (hasPreviousValue && (isUpdatingEvent || isUpdatedEvent)) {
            previousValue = await this.get(key)
        }
        if (hasPreviousValue === false) {
            const event: CreatingEvent<Key, Value> = {
                type: CreatingEventType,
                key,
                value
            }
            await this.dispatchEvent(event)
        } else if (previousValue) {
            const event: UpdatingEvent<Key, Value> = {
                type: UpdatingEventType,
                key,
                previousValue,
                value
            }
            await this.dispatchEvent(event)
        }
        await this.#base.set(key, value)
        if (hasPreviousValue === false) {
            const event: CreatedEvent<Key, Value> = {
                type: CreatedEventType,
                key,
                value
            }
            await this.dispatchEvent(event)
        } else if (previousValue) {
            const event: UpdatedEvent<Key, Value> = {
                type: UpdatedEventType,
                key,
                previousValue,
                value
            }
            await this.dispatchEvent(event)
        }
    }

    async delete(key: Key) {
        const [isDeletingEvent, isDeleted] = await Promise.all([
            this.hasEventListener(DeletingEventType),
            this.hasEventListener(DeletedEventType)
        ])
        let previousValue: Value | undefined
        if (isDeletingEvent || isDeleted) {
            previousValue = await this.get(key)
        }
        if (!previousValue) {
            return
        }
        const deletingEvent: DeletingEvent<Key, Value> = {
            type: DeletingEventType,
            key,
            previousValue
        }
        await this.dispatchEvent(deletingEvent)
        if (this.#base) {
            await this.#base.delete(key)
        }
        const deletedEvent: DeletedEvent<Key, Value> = {
            type: DeletedEventType,
            key,
            previousValue
        }
        await this.dispatchEvent(deletedEvent)
    }

    async has(key: Key): Promise<boolean> {
        if (this.#base) {
            return this.#base.has(key)
        }
        return false
    }

    async *entries(): AsyncIterable<[Key, Value]> {
        if (this.#base) {
            if (this.#base.entries) {
                yield *this.#base.entries()
            } else {
                for await (const key of this.keys()) {
                    const value = await this.get(key)
                    if (typeof value !== "undefined") {
                        yield [key, value]
                    }
                }
            }
        }
    }

    async *keys(): AsyncIterable<Key> {
        if (this.#base) {
            yield *this.#base.keys()
        }
    }

    async *values(): AsyncIterable<Value> {
        if (this.#base) {
            if (this.#base.values) {
                yield *this.#base.values()
            } else {
                for await (const [,value] of this) {
                    yield value
                }
            }
        }
    }

    async *[Symbol.asyncIterator]() {
        yield *this.entries()
    }

}

export type AnyStore<Key extends StoreKey = StoreKey, Value = unknown> = AsyncStore<Key, Value> | SyncStore<Key, Value>

const stores = new WeakMap<Environment, Store>()

export function getStore(): Store {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use Store")
    }
    let store = stores.get(environment)
    if (!store) {
        store = new Store(new Map())
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
