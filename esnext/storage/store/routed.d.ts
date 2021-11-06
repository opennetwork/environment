import { StoreKey } from "./key";
import { Store } from "./store";
export interface StoreRouterFunction<Key extends StoreKey = StoreKey, Value = unknown> {
    (key: Key): Promise<Store<Key, Value> | undefined> | Store<Key, Value> | undefined;
}
export interface GetStoresFunction<Key extends StoreKey = StoreKey, Value = unknown> {
    (): AsyncIterable<Store<Key, Value>> | Iterable<Store<Key, Value>>;
}
export interface StoreRouter<Key extends StoreKey = StoreKey, Value = unknown> {
    getStore: StoreRouterFunction<Key, Value>;
    getStores?: GetStoresFunction<Key, Value> | Iterable<Store<Key, Value>>;
}
export interface RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value>, StoreRouter<Key, Value> {
    getStores(): AsyncIterable<Store<Key, Value>>;
}
export declare class RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> implements RoutedStore<Key, Value> {
    #private;
    constructor(router?: StoreRouter<Key, Value> | StoreRouterFunction<Key, Value>);
    getStore(key: Key): Promise<Store<Key, Value> | undefined>;
    get(key: Key): Promise<Value | undefined>;
    set(key: Key, value: Value): Promise<void>;
    delete(key: Key): Promise<void>;
    has(key: Key): Promise<boolean>;
    entries(): AsyncIterable<[Key, Value]>;
    keys(): AsyncIterable<Key>;
    values(): AsyncIterable<Value>;
}
