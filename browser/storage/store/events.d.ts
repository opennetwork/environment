import { Event, EventCallback, EventTarget } from "../../events/events";
import { StoreKey } from "./key";
export declare const StoreEventNamespace = "@opennetwork/environment/storage/store";
export declare const CreatingEventType = "@opennetwork/environment/storage/store/creating";
export interface CreatingEvent<Key extends StoreKey, Value> extends Event<typeof CreatingEventType> {
    key: Key;
    value: Value;
}
export declare const CreatedEventType = "@opennetwork/environment/storage/store/created";
export interface CreatedEvent<Key extends StoreKey, Value> extends Event<typeof CreatedEventType> {
    key: Key;
    value: Value;
}
export declare const UpdatingEventType = "@opennetwork/environment/storage/store/updating";
export interface UpdatingEvent<Key extends StoreKey, Value> extends Event<typeof UpdatingEventType> {
    key: Key;
    previousValue: Value;
    value: Value;
}
export declare const UpdatedEventType = "@opennetwork/environment/storage/store/updated";
export interface UpdatedEvent<Key extends StoreKey, Value> extends Event<typeof UpdatedEventType> {
    key: Key;
    previousValue: Value;
    value: Value;
}
export declare const DeletingEventType = "@opennetwork/environment/storage/store/deleting";
export interface DeletingEvent<Key extends StoreKey, Value> extends Event<typeof DeletingEventType> {
    key: Key;
    previousValue: Value;
}
export declare const DeletedEventType = "@opennetwork/environment/storage/store/deleted";
export interface DeletedEvent<Key extends StoreKey, Value> extends Event<typeof DeletedEventType> {
    key: Key;
    previousValue: Value;
}
export declare type StoreEvent<Key extends StoreKey, Value> = CreatingEvent<Key, Value> | CreatedEvent<Key, Value> | UpdatingEvent<Key, Value> | UpdatedEvent<Key, Value> | DeletingEvent<Key, Value> | DeletedEvent<Key, Value>;
export declare const StoreEvents: StoreEvent<StoreKey, unknown>["type"][];
export declare function isStoreEvent(value: Event): value is StoreEvent<string, unknown>;
export interface StoreEventTarget<Key extends StoreKey, Value> extends EventTarget {
    addEventListener(type: typeof CreatingEventType, callback: EventCallback<CreatingEvent<Key, Value>>): Promise<void>;
    addEventListener(type: typeof CreatedEventType, callback: EventCallback<CreatedEvent<Key, Value>>): Promise<void>;
    addEventListener(type: typeof UpdatingEventType, callback: EventCallback<UpdatingEvent<Key, Value>>): Promise<void>;
    addEventListener(type: typeof UpdatedEventType, callback: EventCallback<UpdatedEvent<Key, Value>>): Promise<void>;
    addEventListener(type: typeof DeletingEventType, callback: EventCallback<DeletingEvent<Key, Value>>): Promise<void>;
    addEventListener(type: typeof DeletedEventType, callback: EventCallback<DeletedEvent<Key, Value>>): Promise<void>;
}
