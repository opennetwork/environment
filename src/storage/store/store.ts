import {EventTarget} from "../../events/events";
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
} from "./events";

export interface Store<Key extends string = string, Value = unknown> extends AsyncIterable<[Key, Value]> {
    ["__key"]: Key
    ["__value"]: Value
    get(key: Key): Promise<Value | undefined>
    set(key: Key, value: Value): Promise<void>
    delete(key: Key): Promise<void>
    has(key: Key): Promise<boolean>
    entries(): AsyncIterable<[Key, Value]>
    keys(): AsyncIterable<Key>
    values(): AsyncIterable<Value>
}

export class Store<Key extends string = string, Value = unknown> extends EventTarget implements Store<Key, Value> {

    private defaultMap = new Map<Key, Value>()

    constructor() {
        super()
    }

    async get(key: Key) {
        return this.defaultMap.get(key)
    }

    async set(key: Key, value: Value) {
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
        this.defaultMap.set(key, value);
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
        this.defaultMap.delete(key)
        const deletedEvent: DeletedEvent<Key, Value> = {
            type: DeletedEventType,
            key,
            previousValue
        }
        await this.dispatchEvent(deletedEvent)
    }

    async has(key: Key) {
        return this.defaultMap.has(key)
    }

    async *entries() {
        yield *this.defaultMap.entries()
    }

    async *keys() {
        yield *this.defaultMap.keys()
    }

    async *values() {
        yield *this.defaultMap.values()
    }

    async *[Symbol.asyncIterator]() {
        yield *this.entries()
    }

}
