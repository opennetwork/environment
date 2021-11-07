import { EventTarget } from "../../events/events.js";
import { CreatedEventType, CreatingEventType, DeletedEventType, DeletingEventType, UpdatedEventType, UpdatingEventType } from "./events.js";
import { dispatchEvent, getEnvironment } from "../../environment/environment.js";
export class Store extends EventTarget {
    #base;
    constructor(base) {
        super();
        this.#base = base;
    }
    async get(key) {
        if (!this.#base) {
            return undefined;
        }
        return this.#base.get(key);
    }
    async set(key, value) {
        if (!this.#base) {
            return undefined;
        }
        // Setting to undefined or null is same as deletion
        if (typeof value === "undefined" || value === null) {
            return this.delete(key);
        }
        const [isCreatingEvent, isCreatedEvent, isUpdatingEvent, isUpdatedEvent] = await Promise.all([
            this.hasEventListener(CreatingEventType),
            this.hasEventListener(CreatedEventType),
            this.hasEventListener(UpdatingEventType),
            this.hasEventListener(UpdatedEventType)
        ]);
        let hasPreviousValue;
        let previousValue;
        if (isCreatingEvent || isCreatedEvent) {
            hasPreviousValue = await this.has(key);
        }
        if (hasPreviousValue && (isUpdatingEvent || isUpdatedEvent)) {
            previousValue = await this.get(key);
        }
        if (hasPreviousValue === false) {
            const event = {
                type: CreatingEventType,
                key,
                value
            };
            await this.dispatchEvent(event);
        }
        else if (previousValue) {
            const event = {
                type: UpdatingEventType,
                key,
                previousValue,
                value
            };
            await this.dispatchEvent(event);
        }
        await this.#base.set(key, value);
        if (hasPreviousValue === false) {
            const event = {
                type: CreatedEventType,
                key,
                value
            };
            await this.dispatchEvent(event);
        }
        else if (previousValue) {
            const event = {
                type: UpdatedEventType,
                key,
                previousValue,
                value
            };
            await this.dispatchEvent(event);
        }
    }
    async delete(key) {
        const [isDeletingEvent, isDeleted] = await Promise.all([
            this.hasEventListener(DeletingEventType),
            this.hasEventListener(DeletedEventType)
        ]);
        let previousValue;
        if (isDeletingEvent || isDeleted) {
            previousValue = await this.get(key);
        }
        if (!previousValue) {
            return;
        }
        const deletingEvent = {
            type: DeletingEventType,
            key,
            previousValue
        };
        await this.dispatchEvent(deletingEvent);
        if (this.#base) {
            await this.#base.delete(key);
        }
        const deletedEvent = {
            type: DeletedEventType,
            key,
            previousValue
        };
        await this.dispatchEvent(deletedEvent);
    }
    async has(key) {
        if (this.#base) {
            return this.#base.has(key);
        }
        return false;
    }
    async *entries() {
        if (this.#base) {
            if (this.#base.entries) {
                yield* this.#base.entries();
            }
            else {
                for await (const key of this.keys()) {
                    const value = await this.get(key);
                    if (typeof value !== "undefined") {
                        yield [key, value];
                    }
                }
            }
        }
    }
    async *keys() {
        if (this.#base) {
            yield* this.#base.keys();
        }
    }
    async *values() {
        if (this.#base) {
            if (this.#base.values) {
                yield* this.#base.values();
            }
            else {
                for await (const [, value] of this) {
                    yield value;
                }
            }
        }
    }
    async *[Symbol.asyncIterator]() {
        yield* this.entries();
    }
}
const stores = new WeakMap();
export function getStore() {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use Store");
    }
    let store = stores.get(environment);
    if (!store) {
        store = new Store(new Map());
        stores.set(environment, store);
    }
    return store;
}
export async function setStore(store) {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use Store");
    }
    if (stores.get(environment) === store) {
        return;
    }
    stores.set(environment, store);
    await dispatchEvent({
        type: "store:update",
        store
    });
}
