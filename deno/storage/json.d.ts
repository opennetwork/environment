import { AnyStore, Store } from "./store/store";
import { StoreKey } from "./store/key";
export interface ValueIsFn<Value = unknown> {
    (value: unknown): value is Value;
}
export interface JSONStoreOptions<Key extends StoreKey = StoreKey, Value = unknown> {
    base: AnyStore<Key, string>;
    is?: ValueIsFn<Value>;
    noErrorOnBadParse?: boolean;
    reviver?: Parameters<typeof JSON.parse>[1];
    replacer?: Parameters<typeof JSON.stringify>[1];
    space?: Parameters<typeof JSON.stringify>[2];
}
export declare class JSONStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> {
    constructor(options: JSONStoreOptions<Key, Value>);
}
