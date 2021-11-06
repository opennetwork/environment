import { EventTarget } from "../../events/events";
import { StoreKey } from "./key";
export interface SyncStore<Key extends StoreKey = StoreKey, Value = unknown> {
    get(key: Key): Value | undefined;
    set(key: Key, value: Value): void;
    delete(key: Key): boolean;
    has(key: Key): boolean;
    entries?(): Iterable<[Key, Value]>;
    keys(): Iterable<Key>;
    values?(): Iterable<Value>;
}
export interface AsyncStore<Key extends StoreKey = StoreKey, Value = unknown> {
    get(key: Key): Promise<Value | undefined>;
    set(key: Key, value: Value): Promise<void>;
    delete(key: Key): Promise<void>;
    has(key: Key): Promise<boolean>;
    entries?(): AsyncIterable<[Key, Value]>;
    keys(): AsyncIterable<Key>;
    values?(): AsyncIterable<Value>;
}
export interface Store<Key extends StoreKey = StoreKey, Value = unknown> extends AsyncStore<Key, Value>, AsyncIterable<[Key, Value]> {
    ["__key"]: Key;
    ["__value"]: Value;
    entries(): AsyncIterable<[Key, Value]>;
    values(): AsyncIterable<Value>;
}
export declare class Store<Key extends StoreKey = StoreKey, Value = unknown> extends EventTarget implements Store<Key, Value> {
    #private;
    constructor(base?: AsyncStore<Key, Value> | SyncStore<Key, Value> | Map<Key, Value>);
    get(key: Key): Promise<Value | undefined>;
    set(key: Key, value: Value): Promise<void>;
    delete(key: Key): Promise<void>;
    has(key: Key): Promise<boolean>;
    keys(): AsyncIterable<Key>;
    [Symbol.asyncIterator](): AsyncGenerator<[Key, Value], void, undefined>;
}
export declare type AnyStore<Key extends StoreKey = StoreKey, Value = unknown> = AsyncStore<Key, Value> | SyncStore<Key, Value>;
export declare function getStore(): Store;
export declare function setStore(store: Store): Promise<void>;
